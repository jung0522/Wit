import { Router } from 'express';
import { pool } from '../config/db-config.js';
import { response, errResponse } from '../config/response.js';
import { NotFoundError, BadRequestError } from '../config/CustomErrors.js';

const router = Router();

// 제품 상세 정보 불러오기
router.get('/products/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    if (!productId) {
      throw new BadRequestError();
    }

    // 제품 정보 가져오기
    const productQuery = 'SELECT * FROM product WHERE id = ?';
    const [product] = await pool.query(productQuery, [productId]);

    if (product.length === 0) {
      throw new NotFoundError();
    }

    // 리뷰 통계 가져오기
    const averageRatingQuery = 'SELECT AVG(rating) as average_rating, COUNT(*) as review_count FROM review WHERE product_id = ?';
    const [reviewStats] = await pool.query(averageRatingQuery, [productId]);

    // 최신 리뷰 이미지 8개 가져오기
    const latestReviewImagesQuery = 'SELECT image FROM review WHERE product_id = ? AND image IS NOT NULL ORDER BY created_at DESC LIMIT 8';
    const [latestReviewImagesResult] = await pool.query(latestReviewImagesQuery, [productId]);
    const latestReviewImages = latestReviewImagesResult.flatMap(row => row.images.split(',')).slice(0, 8);

    // 도움이 돼요 많은 순 상위 3개 리뷰 가져오기
    const topReviewsQuery = `
    SELECT r.id AS review_id, r.rating, r.content, r.created_at, u.username AS user_name, u.userprofile AS user_profile_image, r.is_true AS helpful_count, r.image AS images
    FROM review r
    JOIN user u ON r.user_id = u.user_id
    WHERE r.product_id = ? AND r.image IS NOT NULL
    ORDER BY r.is_true DESC
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
    console.log(err)
    
  }
});

// 제품 리뷰 목록 불러오기
router.get('/products/:productId/reviews', async (req, res, next) => {
  const { productId } = req.params;
  const { sort = 'latest', limit = 10 } = req.query;

  try {
    let reviewQuery = 'SELECT * FROM review WHERE product_id = ?';
    const queryParams = [productId];

    if (sort === 'best') {
      reviewQuery += ' ORDER BY helpful_count DESC';
    } else {
      reviewQuery += ' ORDER BY created_at DESC';
    }
    reviewQuery += ' LIMIT ?';
    queryParams.push(parseInt(limit, 10));
    const [reviews] = await pool.query(reviewQuery, queryParams);

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
    
    const averageRatingQuery = 'SELECT AVG(rating) as average_rating FROM review WHERE product_id = ?';
    const [averageRatingResult] = await pool.query(averageRatingQuery, [productId]);
    const averageRating = averageRatingResult[0].average_rating || 0;

    const totalReviewsQuery = 'SELECT COUNT(*) as total_reviews FROM review WHERE product_id = ?';
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
    console.log(err)
   
  
  }
});

// 리뷰 작성하기
router.post('/products/:productId/reviews', async (req, res, next) => {
  const { productId } = req.params;
  const { user_id, rating, content, images } = req.body;

  try {
    if (!user_id || !rating) {
      throw new BadRequestError('User ID and rating are required');
    }

    const insertReviewQuery = `
      INSERT INTO review (product_id, user_id, rating, content, image, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const reviewImages = images ? images.join(',') : '';
    const [result] = await pool.query(insertReviewQuery, [productId, user_id, rating, content, reviewImages]);

    const newReviewId = result.insertId;

    const getReviewQuery = `
      SELECT r.id AS review_id, r.rating, r.content, r.created_at, u.username AS user_name, u.userprofile AS user_profile_image, r.is_true AS helpful_count, r.image AS images
      FROM review r
      JOIN user u ON r.user_id = u.user_id
      WHERE r.id = ?
    `;
    const [review] = await pool.query(getReviewQuery, [newReviewId]);

    const responseData = response({
      isSuccess: true,
      code: 201,
      message: 'Review created successfully'
    }, review[0]);

    return res.status(201).json(responseData);
  } catch (err) {
    console.log(err)
  }
});

// 리뷰 정렬 (베스트순/최신순)
router.get('/products/:productId/reviews/sorted', async (req, res, next) => {
  const { productId } = req.params;
  const { sort = 'latest', limit = 10 } = req.query;

  try {
    let reviewsQuery = 'SELECT * FROM review WHERE product_id = ?';
    const queryParams = [productId];

    if (sort === 'best') {
      reviewsQuery += ' ORDER BY is_true DESC';
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
    console.log(err)
  }
});

// 리뷰 작성 페이지
router.get('/products/:productId/reviews/new', async (req, res, next) => {
  const { productId } = req.params;

  try {
    const productQuery = 'SELECT * FROM product WHERE id = ?';
    const [product] = await pool.query(productQuery, [productId]);

    if (product.length === 0) {
      throw new NotFoundError('Product not found');
    }

    const reviewPageData = {
      product_id: product[0].product_id,
      name: product[0].name,
      user_name: '김동빈', 
      rating: null,
      content: null,
      image: []
    };

    const responseData = response({
      isSuccess: true,
      code: 200,
      message: 'Review page data retrieved successfully'
    }, reviewPageData);

    return res.status(200).json(responseData);
  } catch (err) {
    console.log(err)
  }
});

// 상품 별점 불러오기 (별점별 리뷰 개수)
router.get('/products/:productId/rating-stats', async (req, res, next) => {
  const { productId } = req.params;

  try {
    const ratingStatsQuery = `
      SELECT rating, COUNT(*) as count
      FROM review
      WHERE id = ?
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
    console.log(err)
  }
});

// 리뷰에 도움이 돼요 누르기
router.post('/reviews/:reviewId/helpful', async (req, res) => {
  const { reviewId } = req.params;
  const { userId } = req.body;

  try {
    // 이미 도움됨 표시를 했는지 확인
    const checkHelpfulQuery = 'SELECT * FROM review_helpful WHERE review_id = ? AND user_id = ?';
    const [checkHelpful] = await pool.query(checkHelpfulQuery, [reviewId, userId]);

    if (checkHelpful.length > 0) {
      return res.status(400).json({ message: '이미 도움됨으로 표시되었습니다.' });
    }

    // review_helpful 테이블에 기록 추가
    const addHelpfulQuery = 'INSERT INTO review_helpful (review_id, user_id, created_at) VALUES (?, ?, NOW())';
    await pool.query(addHelpfulQuery, [reviewId, userId]);

    // 해당 리뷰에 대해 총 몇 명이 도움됨을 표시했는지 계산
    const totalHelpfulQuery = 'SELECT COUNT(*) AS helpful_count FROM review_helpful WHERE review_id = ?';
    const [totalHelpfulResult] = await pool.query(totalHelpfulQuery, [reviewId]);
    const helpfulCount = totalHelpfulResult[0].helpful_count;

    // 성공 응답 반환, 업데이트된 helpful count 포함
    return res.status(200).json({ message: '리뷰가 도움됨으로 표시되었습니다.', helpful_count: helpfulCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '리뷰 도움됨 표시 중 오류가 발생했습니다.' });
  }
});


export default router;