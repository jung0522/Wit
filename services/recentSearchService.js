import { pool } from '../config/db-config.js';

const saveRecentSearch = async (userId, keyword) => {
  try {
    // 최근 검색어 삽입
    await pool.query(
      `INSERT INTO recent_searches (user_id, keyword) VALUES (?, ?)`,
      [userId, keyword]
    );

    // 사용자의 최근 검색어 개수를 확인
    const [rows] = await pool.query(
      `SELECT id FROM recent_searches WHERE user_id = ? ORDER BY searched_at DESC`,
      [userId]
    );

    // 최근 검색어가 10개를 초과하면 가장 오래된 검색어 삭제
    if (rows.length > 10) {
      const oldestSearchId = rows[rows.length - 1].id;
      await pool.query(`DELETE FROM recent_searches WHERE id = ?`, [oldestSearchId]);
    }
  } catch (err) {
    console.error('Failed to save recent search:', err);
  }
};

export { saveRecentSearch };
