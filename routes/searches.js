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
import {
  decodeAccessToken,
  logout,
  refreshAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../middleware/jwtMiddleware.js';


const router = express.Router();

// 기념품 키워드 검색 기능
router.get('/', decodeAccessToken, async (req, res) => {
  const { query, category, sort,  limit=10 , cursor=0 } = req.query; 
  const { user_id }=req; // 검색 기능에서도 검증해야함
  
  
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
        orderClause = 'ORDER BY product.id ASC'; // 기본적으로 ID 오름차순 정렬 ;
    }
  } else {
    orderClause = 'ORDER BY product.id ASC';
  }

  try {

    const total = await countSearches(whereClause, params);

    const products = await searchProducts(
      whereClause,
      orderClause,
      params,
      user_id,
      cursor,
      limit,
    );
    const nextCursor = products.length > 0 && products.length === parseInt(limit) 
    ? products[products.length - 1].row_num 
    : null;
 

    const result = {
      total: total, //총 검색 결과의 개수 
      products: products,
      nextCursor: nextCursor !==0 ? nextCursor: null, // 다음 페이지의 커서 , 있을 때는 반환하고 없다면 null.
    };

    res.send(response(successStatus.PRODUCTS_SEARCH_SUCCESS, result));

    // 추가 작업: 인기 검색어 업데이트 및 최근 검색어 저장
    if (query) {
      await updatePopularSearches(query);
    }

    // 최근 검색어 저장
    if (query && user_id) {
      await saveRecentSearch(user_id, query);
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
    const keywords = rows.map((row, index) => `${row.keyword}`);

    res.send(response(successStatus.POPULAR_SEARCHES_SUCCESS, keywords));
  } catch (err) {
    res.send(errResponse(errStatus.POPULAR_SEARCHES_FAILED));
  }
});


export default router;
