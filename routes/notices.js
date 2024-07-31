import express from 'express';
import { pool } from '../config/db-config.js';

const router = express.Router();

// 공지사항 목록 조회 
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notice');
    res.success('GET_ALL_POSTS_SUCCESS',rows);
  } catch (err) {
    res.error('INTERNAL_SERVER_ERROR');
  }
});

//공지사항 상세 조회
router.get('/:noticeid', async (req,res) => {
  const noticeId = req.params.noticeid;

  try {
    const [rows]= await pool.query('SELECT * FROM notice WHERE notice_id=?', [noticeId]);

    if (rows.length === 0) {
      return res.error('POST_NOT_FOUND');
    }
    res.success('GET_ONE_POST_SUCCESS', rows[0]);
  } catch (err) {
    res.error('INTERNAL_SERVER_ERROR');
  }
    
});

// 공지사항 새 글 작성
router.post('/', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.error('BAD_REQUEST');
  }

  try {
    const [result] = await pool.query('INSERT INTO notices (title, content) VALUES (?, ?)', [title, content]);
    const noticeId = result.insertId;

    const [rows] = await pool.query('SELECT * FROM notice WHERE notice_id = ?', [noticeId]);

    res.success('MAKE_POST_SUCCESS', rows[0]);
  } catch (err) {
    res.error('POST_CREATION_FAILED');
  }
});

// 공지사항 수정
router.put('/:noticeid', async (req, res) => {
  const noticeId = req.params.noticeid;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.error('BAD_REQUEST');
  }

  try {
    const [result] = await pool.query('UPDATE notice SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE notice_id = ?', [title, content, noticeId]);

    if (result.affectedRows === 0) {
      return res.error('POST_NOT_FOUND');
    }

    const [rows] = await pool.query('SELECT * FROM notice WHERE notice_id = ?', [noticeId]);

    res.success('UPDATE_POST_SUCCESS', rows[0]);
  } catch (err) {
    res.error('POST_UPDATE_FAILED');
  }
});

// 공지사항 삭제
router.delete('/:noticeid', async (req, res) => {
  const noticeId = req.params.noticeid;

  try {
    const [result] = await pool.query('DELETE FROM notice WHERE notice_id = ?', [noticeId]);

    if (result.affectedRows === 0) {
      return res.error('POST_NOT_FOUND');
    }

    res.success('DELETE_POST_SUCCESS', null);
  } catch (err) {
    res.error('POST_DELETE_FAILED');
  }
});

export default router;
