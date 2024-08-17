import { pool } from '../config/db-config.js';
import { errStatus } from '../config/errorStatus.js';
import { logout } from '../middleware/jwtMiddleware.js';

import {
  createUserQuery,
  findAllUserQuery,
  findUserRealIdQuery,
  findOneUserQuery,
  updateUserQuery,
  deleteUserQuery,
} from './userQuery.js';

const createUser = async (userData) => {
  const connection = await pool.getConnection();
  try {
    const { id, name, nickname, age, birthday, social_login } = userData;
    let { gender } = userData;
    if (!name || !nickname || !gender || !age || !birthday || !social_login) {
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
      social_login,
    ]);

    if (row) {
      const [realIdData] = await pool.query(findUserRealIdQuery, [id]);
      const realId = realIdData[0].user_id;
      const [result] = await pool.query(findOneUserQuery, [realId]);
      return result[0];
    }
  } catch (err) {
    console.log(err);
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
  } catch (err) {
    throw new Error(errStatus.USER_ID_IS_WRONG.message);
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

      if (row.warningStatus === 1) {
        console.log(1);
        throw new Error(errStatus.USER_ID_IS_WRONG.message);
      }

      if (row) {
        const [result] = await pool.query(findOneUserQuery, [user_id]);
        return result[0];
      }
    }
  } catch (err) {
    throw new Error(errStatus.USER_ID_IS_WRONG.message);
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
    await logout();
    return row;
  } catch (err) {
  } finally {
    if (connection) connection.release();
  }
};

export { createUser, getAllUser, getOneUser, updateUser, deleteUser };
