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

const createUser = async (userData) => {
  const connection = await pool.getConnection();
  try {
    let row;
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
    [row] = await pool.query(createUserQuery, [
      id,
      name,
      nickname,
      gender,
      age,
      birthday,
    ]);
    connection.release();
    return row;
  } catch (err) {
    throw new BaseError(errStatus.INVALID_USER_DATA.message);
  } finally {
    if (connection) connection.release();
  }
};

const getAllUser = async () => {
  const connection = await pool.getConnection();
  try {
    let row;
    [row] = await pool.query(findAllUserQuery);
    connection.release();
    return row;
  } catch (err) {
    throw new BaseError(errStatus.INTERNAL_SERVER_ERROR.message);
  } finally {
    if (connection) connection.release();
  }
};

const getOneUser = async (id) => {
  let connection;
  try {
    connection = await pool.getConnection();
    if (id === undefined) {
      throw new Error(errStatus.USER_ID_IS_WRONG.message);
    }

    const [row] = await pool.query(findOneUserQuery, [id]);
    if (row.length === 0) {
      return null;
    }

    return row;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const updateUser = async (userData, user_id) => {
  const connection = await pool.getConnection();
  const { username, usernickname, gender, age, birth } = userData;
  try {
    let row;
    if (!username || !usernickname || !gender || !age || !birth) {
      throw new Error(errStatus.INVALID_USER_DATA.message);
    }
    if (user_id !== undefined) {
      [row] = await pool.query(updateUserQuery, [
        username,
        usernickname,
        gender,
        age,
        birth,
        user_id,
      ]);
    } else {
      throw new Error(errStatus.USER_ID_IS_WRONG.message);
    }
    connection.release();
    return row;
  } catch (err) {
    console.log(err);
  } finally {
    if (connection) connection.release();
  }
};

const deleteUser = async (id) => {
  const connection = await pool.getConnection();
  try {
    let row;
    if (id !== undefined) {
      [row] = await pool.query(deleteUserQuery, [id]);
    } else {
      throw new Error(errStatus.USER_ID_IS_WRONG.message);
    }
    connection.release();
    return row;
  } catch (err) {
    console.log(err);
  } finally {
    if (connection) connection.release();
  }
};

export { createUser, getAllUser, getOneUser, updateUser, deleteUser };
