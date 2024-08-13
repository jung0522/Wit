import { pool } from '../config/db-config.js';
import * as searchesQuery from '../models/searchesQuery.js';

const countSearches = async (whereClause, params) => {
    const [rows] = await pool.query(searchesQuery.countSearchesQuery(whereClause), params);
    return rows[0].total;
  };
  
const searchProducts = async (whereClause, orderClause, params, limit, offset) => {
    const [rows] = await pool.query(searchesQuery.searchProductsQuery(whereClause, orderClause), [...params, parseInt(limit), parseInt(offset)]);
    return rows;
  };
  
const getPopularSearches = async () => {
    const [rows] = await pool.query(searchesQuery.popularSearchesQuery);
    return rows;
  };

export {countSearches, searchProducts, getPopularSearches};