import { pool } from '../config/db-config.js';

const saveRecentSearch = async (userId, keyword) => {
  try {
    // 사용자의 기존 검색어를 먼저 확인
    const [existingRows]= await pool.query(
      `SELECT id FROM recent_searches WHERE user_id = ? AND keyword = ?`,
      [userId, keyword]
    );

    // 이미 존재하는 키워드가 없다면 새로 삽입
    if (existingRows.length ==0) {
      await pool.query(
        `INSERT INTO recent_searches (user_id, keyword) VALUES (?, ?)`,
        [userId, keyword]
      );
    } else {
      // 이미 존재하는 경우 `searched_at`을 업데이트
      await pool.query(
        `UPDATE recent_searches SET searched_at = CURRENT_TIMESTAMP WHERE user_id = ? AND keyword = ?`,
        [userId, keyword]
      );
    }

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
