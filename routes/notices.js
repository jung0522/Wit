import express from 'express';
import { pool } from '../config/db-config.js';
import { createNotice, deleteNotice, getAllNotices, getNoticeById, updateNotice } from '../models/noticeDao.js';
import { successStatus } from '../config/successStatus.js';
import { errResponse } from '../config/response.js';
import { errStatus } from '../config/errorStatus.js';
import { response } from '../config/response.js';

const router = express.Router();

// 공지사항 목록 조회 
router.get('/', async (req, res) => {
  try {
    const notices = await getAllNotices();
    res.send(response(successStatus.GET_ALL_POSTS_SUCCESS,notices));
  } catch (err) {
    console.log(err);
    res.send(errResponse(errStatus.INTERNAL_SERVER_ERROR));
   
  }
});

//공지사항 상세 조회
router.get('/:noticeid', async (req,res) => {
  const noticeId = req.params.noticeid;

  try {
   const notice = await getNoticeById(noticeId);

    if (!notice) {
      return res.send(errResponse(errStatus.POST_NOT_FOUND));
    }
    res.send(response(successStatus.GET_ONE_POST_SUCCESS, notice));
  } catch (err) {
    res.send(errResponse(errStatus.INTERNAL_SERVER_ERROR));
  }
    
});

// 공지사항 새 글 작성
router.post('/', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.error('BAD_REQUEST');
  }

  try {
    const noticeId = await createNotice(title,content);
    const notice = await getNoticeById(noticeId);

    res.send(response(successStatus.MAKE_POST_SUCCESS, notice));
  } catch (err) {
    console.log(err);
    res.send(errResponse(errStatus.POST_CREATION_FAILED));
  }
});

// 공지사항 수정
router.put('/:noticeid', async (req, res) => {
  const noticeId = req.params.noticeid;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.send(errResponse(errStatus.BAD_REQUEST));
  }

  try {
    const affectedRows = await updateNotice(noticeId,title,content);

    if (affectedRows === 0) {
      return res.send(errResponse(errStatus.POST_NOT_FOUND));
    }

    const updatedNotice = await getNoticeById(noticeId);

    res.send(response(successStatus.UPDATE_POST_SUCCESS, updateNotice));
  } catch (err) {
    res.send(errResponse(errStatus.POST_UPDATE_FAILED));
  }
});

// 공지사항 삭제
router.delete('/:noticeid', async (req, res) => {
  const noticeId = req.params.noticeid;

  try {
    
    const affectedRows = await deleteNotice(noticeId);

    if (affectedRows === 0) {
      return res.send(errResponse(errStatus.POST_NOT_FOUND));
    }

    res.send(successStatus.DELETE_POST_SUCCESS, null);
  } catch (err) {
    res.send(errResponse(errStatus.POST_DELETE_FAILED));
  }
});

export default router;
