import { pool } from '../config/db-config.js';
import * as noticeQuery from '../models/noticeQuery.js';

// 모든 공지 가져오기 
const getAllNotices = async () => {
    const [rows] = await pool.query(noticeQuery.getAllNoticesQuery);
    return rows;
  };

/* 실제로 필요한 기능은 여기까지 */ 

// 공지사항 상세조회 
const getNoticeById = async (noticeId) => {
    const [rows] = await pool.query(noticeQuery.getNoticeByIdQuery, [noticeId]);
    return rows[0];
  }; 

// 공지사항 새 글 작성 
// 실제로 userid를 받아오게 수정 
const createNotice = async (title, content, userId) => {
    const [result] = await pool.query(noticeQuery.createNoticeQuery, [title, content, userId]);
    return result.insertId;
  }; 
  
const updateNotice = async (noticeId, title, content) => {
    const [result] = await pool.query(noticeQuery.updateNoticeQuery, [title, content, noticeId]);
    return result.affectedRows;
  };
  
const deleteNotice = async (noticeId) => {
    const [result] = await pool.query(noticeQuery.deleteNoticeQuery, [noticeId]);
    return result.affectedRows;
  };

  export {
    getAllNotices,
    getNoticeById,
    createNotice,
    updateNotice,
    deleteNotice,
  };