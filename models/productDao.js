import { pool } from '../config/db-config.js';
import { errStatus } from '../config/errorStatus.js';
import { BaseError } from '../config/error.js';
import { getAllNoticesQuery } from './noticeQuery.js';
import {getPopularProductsByCategoryQuery} from './productQuery.js';


//카테고리별 인기있는 상품 가져오기
export const getPopularProductsByCategory  = async (category) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await pool.query(getPopularProductsByCategoryQuery, [category]);
      return rows;
    } catch (err) {
    } finally {
      if (connection) connection.release();
    }
  };