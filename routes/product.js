import { Router } from 'express';
import { pool } from '../config/db-config.js';
import { response, errResponse } from '../config/response.js';

const router = Router();

// 제품 상세 정보 불러오기
router.get('/products/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    // 제품 정보 가져오기
    const productQuery = 'SELECT * FROM product WHERE product_id = ?';
    const [product] = await pool.query(productQuery, [productId]);

    if (product.length === 0) {
      return res.status(404).json(errResponse({ isSuccess: false, code: 404, message: 'Product not found' }));
    }

    // 리뷰 통계 가져오기
    const averageRatingQuery = 'SELECT AVG(rating) as average_rating, COUNT(*) as review_count FROM reviews WHERE product_id = ?';
    const [reviewStats] = await pool.query(averageRatingQuery, [productId]);

    // 최신 리뷰 이미지 8개 가져오기
    const latestReviewImagesQuery = 'SELECT images FROM reviews WHERE product_id = ? AND images IS NOT NULL ORDER BY created_at DESC LIMIT 8';
    const [latestReviewImagesResult] = await pool.query(latestReviewImagesQuery, [productId]);
    const latestReviewImages = latestReviewImagesResult.flatMap(row => row.images.split(',')).slice(0, 8);

    // 도움이 돼요 많은 순 상위 3개 리뷰 가져오기
    const topReviewsQuery = `
      SELECT r.review_id, r.rating, r.comment, r.created_at, u.name as user_name, u.profile_image as user_profile_image, r.helpful_count, r.images
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.product_id = ? AND r.images IS NOT NULL
      ORDER BY r.helpful_count DESC
      LIMIT 3
    `;
    const [topReviews] = await pool.query(topReviewsQuery, [productId]);

    const responseData = response({
      isSuccess: true,
      code: 200,
      message: 'Product retrieved successfully'
    }, {
      ...product[0],
      average_rating: reviewStats[0].average_rating || 0,
      review_count: reviewStats[0].review_count || 0,
      latest_review_images: latestReviewImages,
      top_reviews: topReviews
    });

    return res.status(200).json(responseData);
  } catch (err) {
    console.error('Error retrieving product:', err);
    return res.status(500).json(errResponse({ isSuccess: false, code: 500, message: 'Failed to retrieve product' }));
  }
});

// 제품 리뷰 목록 불러오기
router.get('/products/:productId/reviews', async (req, res) => {
  const { productId } = req.params;
  const { sort = 'latest', limit = 10 } = req.query;

  try {
    let reviewsQuery = 'SELECT * FROM reviews WHERE product_id = ?';
    const queryParams = [productId];

    if (sort === 'best') {
      reviewsQuery += ' ORDER BY helpful_count DESC';
    } else {
      reviewsQuery += ' ORDER BY created_at DESC';
    }
    reviewsQuery += ' LIMIT ?';
    queryParams.push(parseInt(limit, 10));

    const [reviews] = await pool.query(reviewsQuery, queryParams);

    if (reviews.length === 0) {
      const responseData = response({
        isSuccess: true,
        code: 200,
        message: 'No reviews found for this product'
      }, {
        reviews: [],
        average_rating: 0,
        total_reviews: 0
      });

      return res.status(200).json(responseData);
    }
    
    const averageRatingQuery = 'SELECT AVG(rating) as average_rating FROM reviews WHERE product_id = ?';
    const [averageRatingResult] = await pool.query(averageRatingQuery, [productId]);
    const averageRating = averageRatingResult[0].average_rating || 0;

    const totalReviewsQuery = 'SELECT COUNT(*) as total_reviews FROM reviews WHERE product_id = ?';
    const [totalReviewsResult] = await pool.query(totalReviewsQuery, [productId]);
    const totalReviews = totalReviewsResult[0].total_reviews || 0;

    const responseData = response({
      isSuccess: true,
      code: 200,
      message: 'Reviews retrieved successfully'
    }, {
      reviews,
      average_rating: averageRating,
      total_reviews: totalReviews
    });

    return res.status(200).json(responseData);
  } catch (err) {
    console.error('Error retrieving reviews:', err);
    return res.status(500).json(errResponse({ isSuccess: false, code: 500, message: 'Failed to retrieve reviews' }));
  }
});

// 리뷰 작성하기
router.post('/products/:productId/reviews', async (req, res) => {
  const { productId } = req.params;
  const { user_id, rating, comment, images } = req.body;

  try {
    const insertReviewQuery = `
      INSERT INTO reviews (product_id, user_id, rating, comment, images, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const reviewImages = images.join(',');
    const [result] = await pool.query(insertReviewQuery, [productId, user_id, rating, comment, reviewImages]);

    const newReviewId = result.insertId;

    const getReviewQuery = `
      SELECT r.review_id, r.rating, r.comment, r.created_at, u.name as user_name, u.profile_image as user_profile_image, r.helpful_count, r.images
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.review_id = ?
    `;
    const [review] = await pool.query(getReviewQuery, [newReviewId]);

    const responseData = response({
      isSuccess: true,
      code: 201,
      message: 'Review created successfully'
    }, review[0]);

    return res.status(201).json(responseData);
  } catch (err) {
    console.error('Error creating review:', err);
    return res.status(500).json(errResponse({ isSuccess: false, code: 500, message: 'Failed to create review' }));
  }
});

// 리뷰 정렬 (베스트순/최신순)
router.get('/products/:productId/reviews/sorted', async (req, res) => {
  const { productId } = req.params;
  const { sort = 'latest', limit = 10 } = req.query;

  try {
    let reviewsQuery = 'SELECT * FROM reviews WHERE product_id = ?';
    const queryParams = [productId];

    if (sort === 'best') {
      reviewsQuery += ' ORDER BY helpful_count DESC';
    } else {
      reviewsQuery += ' ORDER BY created_at DESC';
    }
    reviewsQuery += ' LIMIT ?';
    queryParams.push(parseInt(limit, 10));

    const [reviews] = await pool.query(reviewsQuery, queryParams);

    const responseData = response({
      isSuccess: true,
      code: 200,
      message: 'Reviews sorted successfully'
    }, reviews);

    return res.status(200).json(responseData);
  } catch (err) {
    console.error('Error sorting reviews:', err);
    return res.status(500).json(errResponse({ isSuccess: false, code: 500, message: 'Failed to sort reviews' }));
  }
});

// 리뷰 작성 페이지
router.get('/products/:productId/reviews/new', async (req, res) => {
  const { productId } = req.params;

  try {
    const productQuery = 'SELECT * FROM product WHERE product_id = ?';
    const [product] = await pool.query(productQuery, [productId]);

    if (product.length === 0) {
      return res.status(404).json(errResponse({ isSuccess: false, code: 404, message: 'Product not found' }));
    }

    const reviewPageData = {
      product_id: product[0].product_id,
      name: product[0].name,
      user_name: '김동빈', // 이 부분은 사용자 정보에서 가져와야 하지만 예시로 임의 값을 넣었습니다.
      rating: null,
      comment: null,
      images: []
    };

    const responseData = response({
      isSuccess: true,
      code: 200,
      message: 'Review page data retrieved successfully'
    }, reviewPageData);

    return res.status(200).json(responseData);
  } catch (err) {
    console.error('Error retrieving review page data:', err);
    return res.status(500).json(errResponse({ isSuccess: false, code: 500, message: 'Failed to retrieve review page data' }));
  }
});

// 상품 별점 불러오기 (별점별 리뷰 개수)
router.get('/products/:productId/rating-stats', async (req, res) => {
  const { productId } = req.params;

  try {
    const ratingStatsQuery = `
      SELECT rating, COUNT(*) as count
      FROM reviews
      WHERE product_id = ?
      GROUP BY rating
    `;
    const [ratingStats] = await pool.query(ratingStatsQuery, [productId]);

    const stats = ratingStats.reduce((acc, row) => {
      acc[row.rating] = row.count;
      return acc;
    }, {});

    const responseData = response({
      isSuccess: true,
      code: 200,
      message: 'Rating stats retrieved successfully'
    }, stats);

    return res.status(200).json(responseData);
  } catch (err) {
    console.error('Error retrieving rating stats:', err);
    return res.status(500).json(errResponse({ isSuccess: false, code: 500, message: 'Failed to retrieve rating stats' }));
  }
});

// 리뷰에 도움이 돼요 누르기
router.post('/reviews/:reviewId/helpful', async (req, res) => {
  const { reviewId } = req.params;
  const { userId } = req.body;

  try {
    // 이미 '도움이 돼요'를 눌렀는지 확인
    const checkHelpfulQuery = 'SELECT * FROM review_helpful WHERE review_id = ? AND user_id = ?';
    const [checkHelpful] = await pool.query(checkHelpfulQuery, [reviewId, userId]);

    if (checkHelpful.length > 0) {
      return res.status(400).json(errResponse({ isSuccess: false, code: 400, message: 'Already marked as helpful' }));
    }

    // '도움이 돼요' 추가
    const addHelpfulQuery = 'INSERT INTO review_helpful (review_id, user_id) VALUES (?, ?)';
    await pool.query(addHelpfulQuery, [reviewId, userId]);

    // 리뷰의 helpful_count 증가
    const updateHelpfulCountQuery = 'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE review_id = ?';
    await pool.query(updateHelpfulCountQuery, [reviewId]);

    const responseData = response({
      isSuccess: true,
      code: 200,
      message: 'Marked review as helpful successfully'
    });

    return res.status(200).json(responseData);
  } catch (err) {
    console.error('Error marking review as helpful:', err);
    return res.status(500).json(errResponse({ isSuccess: false, code: 500, message: 'Failed to mark review as helpful' }));
  }
});

export default router;
