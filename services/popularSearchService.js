import { pool } from '../config/db-config.js';

const updatePopularSearches = async (keyword) => {
  try {
    // 이미 존재하는 검색어인지 확인
    const [rows] = await pool.query(
      `SELECT * FROM popular_searches WHERE keyword = ?`, [keyword]
    );

    if (rows.length > 0) {
      // 이미 존재하는 경우, search_count 증가
      await pool.query(
        `UPDATE popular_searches SET search_count = search_count + 1, last_searched_at = CURRENT_TIMESTAMP WHERE keyword = ?`, [keyword]
      );
    } else {
      // 존재하지 않는 경우, 새로 삽입
      await pool.query(
        `INSERT INTO popular_searches (keyword) VALUES (?)`, [keyword]
      );
    }
  } catch (err) {
    console.error('Failed to update popular searches:', err);
  }
};

export { updatePopularSearches };
