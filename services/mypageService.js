// services/mypageService.js

import { pool } from '../config/db-config.js';

export const getUserProfile = async (userId) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, username, usernickname, userprofile, gender, age, birth FROM user WHERE user_id = ?',
      [userId]
    );
    return rows[0]; // 단일 사용자 정보를 반환
  } catch (error) {
    throw new Error('데이터베이스 쿼리 오류');
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const { username, usernickname, gender, birth } = profileData;

    const [result] = await pool.query(
      'UPDATE user SET username = ?, usernickname = ?, gender = ?, birth = ? WHERE user_id = ?',
      [username, usernickname, gender, birth, userId]
    );

    if (result.affectedRows === 0) {
      return null; // 사용자가 존재하지 않는 경우
    }

    // 업데이트된 사용자 정보를 반환
    const [rows] = await pool.query(
      'SELECT user_id, username, usernickname, gender, birth FROM user WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  } catch (error) {
    throw new Error('데이터베이스 쿼리 오류');
  }
};

// 사용자 삭제 함수
export const deleteUser = async (userId) => {
    try {
      const [result] = await pool.query(
        'DELETE FROM user WHERE user_id = ?',
        [userId]
      );
      return result.affectedRows > 0; // 삭제된 행이 있는지 확인
    } catch (error) {
      throw new Error('데이터베이스 쿼리 오류');
    }
  };
  