import { pool } from '../config/db-config.js';
import * as searchesQuery from '../models/searchesQuery.js';

const countSearches = async (whereClause, params) => {
    const [rows] = await pool.query(searchesQuery.countSearchesQuery(whereClause), params);
    return rows[0].total;
  };

const searchProducts = async (whereClause, orderClause, params, userId, cursor, limit ) => {
 
    const [rows] = await pool.query(searchesQuery.searchProductsQuery(whereClause, orderClause),
     [userId, ...params, cursor, parseInt(limit)]
     );
    return rows;
  };
  
const getPopularSearches = async () => {
    const [rows] = await pool.query(searchesQuery.popularSearchesQuery);
    return rows;
  };

const getRecentSearches = async (userId) => {
  const [rows]= await pool.query(searchesQuery.getRecentSearchesQuery,[userId]);
  return rows.map(row => row.keyword);
};

const deleteRecentSearches = async (userId, keyword) => {
  try {
    const [result] = await pool.query(searchesQuery.deleteRecentSearchQuery, [userId, keyword]);
    return result.affectedRows > 0; // 하나 이상의 행이 삭제되었는지 확인 
  } catch (err) {
    console.error('최근 검색어 지우기 작업을 실패하였습니다.',err);
    throw err;
  }
};

const deleteAllRecentSearches = async (userId) => {
  try {
    const [result]= await pool.query(searchesQuery.deleteAllRecentSearchesQuery, [userId]);
    return result.affectedRows > 0; // 하나 이상의 행이 삭제되었는지 확인 
  } catch (err) {
    console.error('전체 검색어 지우기 작업을 실패하였습니다.',err);
    throw err;
  }
};

export {countSearches,
        searchProducts, 
        getPopularSearches, 
        getRecentSearches, 
        deleteRecentSearches, 
        deleteAllRecentSearches};