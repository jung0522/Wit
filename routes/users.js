import express from 'express';
import { pool } from '../config/db-config.js';
import { successStatus } from '../config/successStatus.js';
import { errResponse } from '../config/response.js';
import { errStatus } from '../config/errorStatus.js';
import { response } from '../config/response.js';
import { getRecentSearches } from '../models/searchesDao.js';

const router = express.Router();

// 최근 검색어 조회
router.get('/:userId/recent-searches', async (req, res) => {
  
  const { userId } = req.params;

  try {
    const keywords= await getRecentSearches(userId);
    res.send(response(successStatus.RECENT_SEARCHES_SUCCESS, keywords));
  } catch (err) {
    console.log(err);
    res.send(errResponse(errStatus.RECENT_SEARCHES_FAILED));
  }
});

export default router;
