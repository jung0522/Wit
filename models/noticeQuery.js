const getAllNoticesQuery= 'SELECT * FROM notice';

const getNoticeByIdQuery= 'SELECT * FROM notice WHERE notice_id=?';

const createNoticeQuery= 'INSERT INTO notice (title, content, user_id) VALUES (?, ?, ?)';

const updateNoticeQuery = 
'UPDATE notice SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE notice_id = ?';

const deleteNoticeQuery = 'DELETE FROM notice WHERE notice_id = ?';

export {
    getAllNoticesQuery,
    getNoticeByIdQuery,
    createNoticeQuery,
    updateNoticeQuery,
    deleteNoticeQuery

};