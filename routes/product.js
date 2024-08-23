import { Router } from 'express';
import { pool } from '../config/db-config.js';
import { response, errResponse } from '../config/response.js';
import { NotFoundError, BadRequestError } from '../config/CustomErrors.js';
import { successStatus } from '../config/successStatus.js';
import { imageUploader } from '../middleware/imageUploader.js'; // 이미지 업로더 미들웨어 추가
import {decodeAccessToken} from '../middleware/jwtMiddleware.js';

const router = Router();

// 제품 상세 정보 불러오기
router.get('/:productId',decodeAccessToken, async (req, res) => {
  
  const user_id = req.user_id; // Extract user_id from request object
  const { productId } = req.params;

  try {
    if (!productId) {
      throw new BadRequestError();
    }

    // 제품 정보 가져오기
    const productQuery = 'SELECT p.*, CASE WHEN user_heart.product_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_heart FROM product p LEFT JOIN mine wish ON p.id = wish.product_id LEFT JOIN user_heart ON p.id = user_heart.product_id AND user_heart.user_id = 66 WHERE p.id = 1;';
    const [product] = await pool.query(productQuery, [productId], user_id);

    if (product.length === 0) {
      throw new NotFoundError();
    }

    // 리뷰 통계 가져오기
    const averageRatingQuery =
      'SELECT AVG(rating) as average_rating, COUNT(*) as review_count FROM review WHERE product_id = ?';
    const [reviewStats] = await pool.query(averageRatingQuery, [productId]);

    // 최신 리뷰 이미지 8개 가져오기
    const latestReviewImagesQuery =
      'SELECT image FROM review WHERE product_id = ? AND image IS NOT NULL ORDER BY created_at DESC LIMIT 8';
    const [latestReviewImagesResult] = await pool.query(
      latestReviewImagesQuery,
      [productId]
    );
    const latestReviewImages = latestReviewImagesResult
      .flatMap((row) => {
        return row.image ? row.image.split(',') : [];
      })
      .slice(0, 8);

    // 도움이 돼요 많은 순 상위 3개 리뷰 가져오기
    const topReviewsQuery = `
    SELECT r.id AS review_id, r.rating, r.content, r.created_at, u.username AS user_name, u.userprofile AS user_profile_image, r.image AS images,
           (SELECT COUNT(*) FROM review_helpful rh WHERE rh.review_id = r.id) AS helpful_count
    FROM review r
    JOIN user u ON r.user_id = u.user_id
    WHERE r.product_id = ? AND r.image IS NOT NULL
    ORDER BY helpful_count DESC
    LIMIT 3
  `;

    const [topReviews] = await pool.query(topReviewsQuery, [productId]);

    const responseData = response(
      {
        isSuccess: true,
        code: 200,
        message: 'Product retrieved successfully',
      },
      {
        ...product[0],
        average_rating: reviewStats[0].average_rating || 0,
        review_count: reviewStats[0].review_count || 0,
        latest_review_images: latestReviewImages,
        top_reviews: topReviews,
      }
    );

    return res.status(200).json(responseData);
  } catch (err) {
    console.log(err);
  }
});

// 새로운 리뷰 목록 불러오기
router.get('/:productId/reviews/overview', decodeAccessToken, async (req, res) => {
  const { productId } = req.params;

  try {
    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }

    // 1. 리뷰 개수 가져오기
    const reviewCountQuery = `
      SELECT COUNT(*) as review_count
      FROM review
      WHERE product_id = ?
    `;
    const [reviewCountResult] = await pool.query(reviewCountQuery, [productId]);
    const reviewCount = reviewCountResult[0].review_count || 0;

    // 2. 평균 별점 가져오기
    const averageRatingQuery = `
      SELECT AVG(rating) as average_rating
      FROM review
      WHERE product_id = ?
    `;
    const [averageRatingResult] = await pool.query(averageRatingQuery, [productId]);
    const averageRating = averageRatingResult[0].average_rating || 0;

    // 3. 리뷰에 올라온 최신 사진 8개 가져오기
    const latestImagesQuery = `
      SELECT image
      FROM review
      WHERE product_id = ? AND image IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 8
    `;
    const [latestImagesResult] = await pool.query(latestImagesQuery, [productId]);
    const latestImages = latestImagesResult
      .flatMap(row => row.image ? row.image.split(',') : [])
      .slice(0, 8);

    // 4. 사진이 있는 리뷰 중 도움이 돼요 많은 순 상위 3개 리뷰 가져오기 (첫번째 사진만)
    const topHelpfulReviewsQuery = `
      SELECT r.id AS review_id, r.rating, r.content, r.created_at, u.username AS user_name, u.userprofile AS user_profile_image,
             (SELECT SUBSTRING_INDEX(r.image, ',', 1)) AS first_image,
             (SELECT COUNT(*) FROM review_helpful rh WHERE rh.review_id = r.id) AS helpful_count
      FROM review r
      JOIN user u ON r.user_id = u.user_id
      WHERE r.product_id = ? AND r.image IS NOT NULL
      ORDER BY helpful_count DESC
      LIMIT 3
    `;
    const [topHelpfulReviews] = await pool.query(topHelpfulReviewsQuery, [productId]);

    const responseData = response(
      {
        isSuccess: true,
        code: 200,
        message: 'Review overview retrieved successfully',
      },
      {
        review_count: reviewCount,
        average_rating: averageRating,
        latest_images: latestImages,
        top_helpful_reviews: topHelpfulReviews,
      }
    );

    return res.status(200).json(responseData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      code: 500,
      message: '리뷰 목록 불러오기 중 오류가 발생했습니다.',
    });
  }
});

// 제품 리뷰 목록 불러오기 (베스트순, 최신순), 커서 페이지네이션 구현
router.get('/:productId/reviews', decodeAccessToken, async (req, res, next) => {
  const { productId } = req.params;
  const { cursor = 0, sort = 'latest', limit = 10 } = req.query;
  const { user_id } = req; // 디코딩된 토큰에서 user_id 사용

  try {
    let whereClause = 'WHERE r.product_id = ?';
    const params = [productId];

    if (cursor) {
      if (sort === 'best') {
        whereClause += ` AND (
                            (SELECT COUNT(*) FROM review_helpful rh WHERE rh.review_id = r.id) < 
                            (SELECT COUNT(*) FROM review_helpful rh WHERE rh.review_id = ?) 
                            OR 
                            ((SELECT COUNT(*) FROM review_helpful rh WHERE rh.review_id = r.id) = 
                            (SELECT COUNT(*) FROM review_helpful rh WHERE rh.review_id = ?) AND r.id < ?)
                         )`;
        params.push(cursor, cursor, cursor);
      } else if (sort === 'latest') {
        whereClause += ` AND (
                            r.created_at < (SELECT created_at FROM review WHERE id = ?) 
                            OR 
                            (r.created_at = (SELECT created_at FROM review WHERE id = ?) AND r.id < ?)
                         )`;
        params.push(cursor, cursor, cursor);
      }
    }

    let orderClause = '';
    if (sort === 'best') {
      orderClause = 'ORDER BY helpful_count DESC, r.id DESC';
    } else {
      orderClause = 'ORDER BY r.created_at DESC, r.id DESC';
    }

    const reviewQuery = `
      SELECT r.id AS review_id, r.rating, r.content, r.created_at, u.username AS user_name, u.userprofile AS user_profile_image, r.image AS images,
             (SELECT COUNT(*) FROM review_helpful rh WHERE rh.review_id = r.id) AS helpful_count,  
             (SELECT 1 FROM review_helpful rh WHERE rh.review_id = r.id AND rh.user_id = ?) AS user_helped  
      FROM review r
      JOIN user u ON r.user_id = u.user_id
      ${whereClause}
      ${orderClause}
      LIMIT ?
    `;

    params.push(parseInt(limit, 10));
    const [reviews] = await pool.query(reviewQuery, [user_id, ...params]);

    if (reviews.length === 0) {
      return res.status(200).json(response(successStatus.REVIEWS_RETRIEVED, {
        reviews: [],
        average_rating: 0,
        total_reviews: 0,
        nextCursor: null,
      }));
    }

    const nextCursor = reviews.length === parseInt(limit, 10) ? reviews[reviews.length - 1].review_id : null;

    const averageRatingQuery =
      'SELECT AVG(rating) as average_rating FROM review WHERE product_id = ?';
    const [averageRatingResult] = await pool.query(averageRatingQuery, [productId]);
    const averageRating = averageRatingResult[0].average_rating || 0;

    const totalReviewsQuery =
      'SELECT COUNT(*) as total_reviews FROM review WHERE product_id = ?';
    const [totalReviewsResult] = await pool.query(totalReviewsQuery, [productId]);
    const totalReviews = totalReviewsResult[0].total_reviews || 0;

    return res.status(200).json(response(successStatus.REVIEWS_RETRIEVED, {
      reviews,
      average_rating: averageRating,
      total_reviews: totalReviews,
      nextCursor,
    }));

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      isSuccess: false,
      code: 500,
      message: '리뷰 목록 불러오기 중 오류가 발생했습니다.',
    });
  }
});


// 리뷰 작성하기 -> 이미지 업로드 통합
router.post('/:productId/reviews', decodeAccessToken, imageUploader.single('image'), async (req, res, next) => {
  const { productId } = req.params;
  const { rating, content } = req.body;
  const file = req.file; // 업로드된 이미지 파일
  const { user_id } = req; // 디코딩된 토큰에서 user_id 사용

  try {
    if (!user_id || !rating) {
      throw new BadRequestError('User ID and rating are required');
    }

    // 이미지 업로드가 있는 경우, S3에서 이미지 URL 가져오기
    const imageUrl = file ? file.location : null;

    const insertReviewQuery = `
      INSERT INTO review (product_id, user_id, rating, content, image, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await pool.query(insertReviewQuery, [
      productId,
      user_id,
      rating,
      content,
      imageUrl,  // 이미지 URL 저장
    ]);

    const newReviewId = result.insertId;

    const getReviewQuery = `
      SELECT r.id AS review_id, r.rating, r.content, r.created_at, u.username AS user_name, u.userprofile AS user_profile_image, r.image AS images
      FROM review r
      JOIN user u ON r.user_id = u.user_id
      WHERE r.id = ?
    `;

    const [review] = await pool.query(getReviewQuery, [newReviewId]);

    const responseData = response(
      {
        isSuccess: true,
        code: 201,
        message: 'Review with image created successfully',
      },
      review[0]
    );

    return res.status(201).json(responseData);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      isSuccess: false,
      code: 500,
      message: '리뷰 생성 중 오류가 발생했습니다.',
    });
  }
});

// 리뷰 작성 페이지
router.get('/:productId/reviews/new', decodeAccessToken, async (req, res, next) => {
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
      image: [],
    };

    const responseData = response(
      {
        isSuccess: true,
        code: 200,
        message: 'Review page data retrieved successfully',
      },
      reviewPageData
    );

    return res.status(200).json(responseData);
  } catch (err) {
    console.log(err);
  }
});

// 상품 별점 불러오기 (별점별 리뷰 개수)
router.get('/:productId/rating-stats', decodeAccessToken, async (req, res, next) => {
  const { productId } = req.params;

  try {
    const ratingStatsQuery = `
      SELECT FLOOR(rating) as rounded_rating, COUNT(*) as count
      FROM review
      WHERE product_id = ?
      GROUP BY rounded_rating
    `;
    const [ratingStats] = await pool.query(ratingStatsQuery, [productId]);
    const stats = ratingStats.reduce((acc, row) => {
      acc[row.rounded_rating] = row.count;
      return acc;
    }, {});

    const responseData = response(
      {
        isSuccess: true,
        code: 200,
        message: 'Rating stats retrieved successfully',
      },
      stats
    );

    return res.status(200).json(responseData);
  } catch (err) {
    console.log(err);
  }
});

// 리뷰에 도움이 돼요 누르기
router.post('/:productId/reviews/:reviewId/helpful', decodeAccessToken, async (req, res) => {
  const { reviewId } = req.params;
  const { user_id } = req; // 디코딩된 토큰에서 user_id 사용

  try {
    // 이미 도움됨 표시를 했는지 확인
    const checkHelpfulQuery =
      'SELECT * FROM review_helpful WHERE review_id = ? AND user_id = ?';
    const [checkHelpful] = await pool.query(checkHelpfulQuery, [reviewId, user_id]);

    if (checkHelpful.length > 0) {
      return res
        .status(400)
        .json({ message: '이미 도움됨으로 표시되었습니다.' });
    }

    // review_helpful 테이블에 기록 추가
    const addHelpfulQuery =
      'INSERT INTO review_helpful (review_id, user_id, created_at) VALUES (?, ?, NOW())';
    await pool.query(addHelpfulQuery, [reviewId, user_id]);

    // 해당 리뷰에 대해 총 몇 명이 도움됨을 표시했는지 계산
    const totalHelpfulQuery =
      'SELECT COUNT(*) AS helpful_count FROM review_helpful WHERE review_id = ?';
    const [totalHelpfulResult] = await pool.query(totalHelpfulQuery, [
      reviewId,
    ]);
    const helpfulCount = totalHelpfulResult[0].helpful_count;

    // 성공 응답 반환, 업데이트된 helpful count 포함
    return res.status(200).json({
      message: '리뷰가 도움됨으로 표시되었습니다.',
      helpful_count: helpfulCount,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: '리뷰 도움됨 표시 중 오류가 발생했습니다.' });
  }
});

export default router;
