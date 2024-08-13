import express from 'express';
import { pool } from '../config/db-config.js';

const router = express.Router();

// 최근 검색어 조회
router.get('/:userId/recent-searches', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT keyword FROM recent_searches 
       WHERE user_id = ? 
       ORDER BY searched_at DESC 
       LIMIT 10`, 
      [userId]
    );

    const keywords = rows.map(row => row.keyword);

    res.success('RECENT_SEARCHES_SUCCESS', keywords);
  } catch (err) {
    res.error('RECENT_SEARCHES_FAILED');
  }
});

export default router;


