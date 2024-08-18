import express from 'express';
import { saveRecentSearch } from '../services/recentSearchService.js';
import { updatePopularSearches } from '../services/popularSearchService.js';
import {
  countSearches,
  searchProducts,
  getPopularSearches,
} from '../models/searchesDao.js';
import { successStatus } from '../config/successStatus.js';
import { errResponse } from '../config/response.js';
import { response } from '../config/response.js';

import { errStatus } from '../config/errorStatus.js';

const router = express.Router();

// 기념품 키워드 검색 기능
router.get('/', async (req, res) => {
  const { query, category, sort, page = 1, limit = 10, userId } = req.query; // userId를 쿼리 파라미터로 받아야함
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
        orderClause = 'ORDER BY Mine.check_count DESC';
        break;
      case 'rating':
        orderClause = 'ORDER BY rating DESC';
        break;
      default:
        orderClause = '';
    }
  }

  try {

    const total = await countSearches(whereClause, params);
    const products = await searchProducts(
      whereClause,
      orderClause,
      params,
      limit,
      offset
    );

    const result = {
      total: total, //총 검색 결과의 개수 
      page: parseInt(page),
      limit: parseInt(limit),
      products: products,
    };

    res.send(response(successStatus.PRODUCTS_SEARCH_SUCCESS, result));

    // 추가 작업: 인기 검색어 업데이트 및 최근 검색어 저장
    if (query) {
      await updatePopularSearches(query);
    }

    // 최근 검색어 저장
    if (query && userId) {
      await saveRecentSearch(userId, query);
    }
  } catch (err) {
    console.log(err);
    res.send(errResponse(errStatus.PRODUCTS_SEARCH_FAILED));
  }
});

// 인기 검색어 조회 기능 (상위 10개)
router.get('/popular', async (req, res) => {
  try {
    const rows = await getPopularSearches();
    const keywords = rows.map((row, index) => `${index + 1}위: ${row.keyword}`);

    res.send(response(successStatus.POPULAR_SEARCHES_SUCCESS, keywords));
  } catch (err) {
    res.send(errResponse(errStatus.POPULAR_SEARCHES_FAILED));
  }
});

export default router;
