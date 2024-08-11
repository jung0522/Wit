import express from 'express';
import { pool } from '../config/db-config.js';
import { saveRecentSearch } from '../services/recentSearchService.js';
import { updatePopularSearches } from '../services/popularSearchService.js';

const router = express.Router();

// 기념품 키워드 검색 기능
router.get('/', async (req, res) => {
  const { query, category, sort, page = 1, limit = 10 , userId } = req.query; // userId를 쿼리 파라미터로 받아야함 
  const offset = (page - 1) * limit;

  let whereClause = '';
  let params = [];

  if (query) {
    whereClause += 'WHERE name LIKE ? ';
    params.push(`%${query}%`);
  }

  if (category) {
    if (whereClause) {
      whereClause += 'AND product.sub_category_id = ? ';
    } else {
      whereClause += 'WHERE product.sub_category_id = ? ';
    }
    params.push(category);
  }

  let orderClause = '';
  if (sort) {
    switch (sort) {
      case 'price_asc':
        orderClause = 'ORDER BY product.won_price ASC';
        break;
      case 'price_desc':
        orderClause = 'ORDER BY product.won_price DESC';
        break;
      case 'popularity':
        orderClause = 'ORDER BY reviews DESC';
        break;
      case 'rating':
        orderClause = 'ORDER BY rating DESC';
        break;
      default:
        orderClause = '';
    }
  }

  try {
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM product ${whereClause}`, params);
    const total = countRows[0].total;

    const [rows] = await pool.query(
        `SELECT product.id, product.name, product.won_price, product.en_price, product.image, 
              COUNT(review.id) as reviews, AVG(review.rating) as rating 
       FROM product 
       LEFT JOIN review ON product.id = review.product_id 
       ${whereClause} 
       GROUP BY product.id 
       ${orderClause} 
       LIMIT ? OFFSET ?`, 
        [...params, parseInt(limit), parseInt(offset)]
        );

    const result = {
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
      products: rows
    };

    res.success('PRODUCTS_SEARCH_SUCCESS', result);

    // 추가 작업: 인기 검색어 업데이트 및 최근 검색어 저장
    if (query) {
      await updatePopularSearches(query);
    }

    // 최근 검색어 저장
    if (query && userId) {
      await saveRecentSearch(userId, query);
    }


  } catch (err) {
    res.error('PRODUCTS_SEARCH_FAILED');
  }
});

// 인기 검색어 조회 기능 (상위 10개)
router.get('/popular', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT keyword FROM popular_searches 
       ORDER BY search_count DESC, last_searched_at DESC 
       LIMIT 10`
    );

    const keywords = rows.map((row, index) => {
      return `${index + 1}위: ${row.keyword}`;
    });

    res.success('POPULAR_SEARCHES_SUCCESS', keywords);
  } catch (err) {
    res.error('POPULAR_SEARCHES_FAILED');
  }
});



export default router;


