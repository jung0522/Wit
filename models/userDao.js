import { pool } from '../config/db-config.js';
import { errStatus } from '../config/errorStatus.js';
import { BaseError } from '../config/error.js';

import {
  createUserQuery,
  findAllUserQuery,
  findOneUserQuery,
  updateUserQuery,
  deleteUserQuery,
} from './userQuery.js';

// 에러 처리 어케할지 고민 좀 하자
const createUser = async (userData) => {
  const connection = await pool.getConnection();
  try {
    const { id, name, nickname, age, birthday } = userData;
    let { gender } = userData;
    if (!name || !nickname || !gender || !age || !birthday) {
      throw new Error(errStatus.INVALID_USER_DATA.message);
    }
    if (gender === 'M') {
      gender = 'male';
    } else if (gender === 'F') {
      gender = 'female';
    }
    const [row] = await pool.query(createUserQuery, [
      id,
      name,
      nickname,
      gender,
      age,
      birthday,
    ]);
    if (row) {
      const [result] = await pool.query(findOneUserQuery, [id]);
      return result[0];
    }
  } catch (err) {
  } finally {
    if (connection) connection.release();
  }
};

const getAllUser = async () => {
  const connection = await pool.getConnection();
  try {
    const [row] = await pool.query(findAllUserQuery);
    return row;
  } catch (err) {
  } finally {
    if (connection) connection.release();
  }
};

const getOneUser = async (id) => {
  const connection = await pool.getConnection();
  try {
    if (!id) {
      throw new Error(errStatus.USER_ID_IS_WRONG.message);
    }
    const [row] = await pool.query(findOneUserQuery, [id]);

    if (row.length === 0) {
      return null;
    }

    return row[0];
  } catch (error) {
  } finally {
    if (connection) connection.release();
  }
};

const updateUser = async (userData, user_id) => {
  const connection = await pool.getConnection();
  const { username, usernickname, gender, age, birth } = userData;
  try {
    if (!username || !usernickname || !gender || !age || !birth) {
      throw new Error(errStatus.INVALID_USER_DATA.message);
    }

    if (user_id !== undefined) {
      const [row] = await pool.query(updateUserQuery, [
        username,
        usernickname,
        gender,
        age,
        birth,
        user_id,
      ]);
      if (row) {
        const [result] = await pool.query(findOneUserQuery, [user_id]);
        return result[0];
      }
    } else {
      throw new Error(errStatus.USER_ID_IS_WRONG.message);
    }
  } catch (err) {
  } finally {
    if (connection) connection.release();
  }
};

const deleteUser = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [row] = await pool.query(deleteUserQuery, [id]);

    if (!id) {
      throw new Error(errStatus.USER_ID_IS_WRONG.message);
    }
    return row;
  } catch (err) {
  } finally {
    if (connection) connection.release();
  }
};

export { createUser, getAllUser, getOneUser, updateUser, deleteUser };
