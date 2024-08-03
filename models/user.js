import { pool } from '../config/db-config.js';
import { errStatus } from '../config/errorStatus.js';

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
    const { id, name, nickname, gender, age, birthday } = userData;
    userData[row] = await pool.query(createUserQuery, [
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
    console.log(err);
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
    console.log(err);
  } finally {
    if (connection) connection.release();
  }
};

const getOneUser = async (id) => {
  let connection;
  try {
    connection = await pool.getConnection();
    let row;
    if (id !== undefined) {
      [row] = await pool.query(findOneUserQuery, [id]);
    } else {
      throw new Error(errStatus.USERID_IS_WRONG);
    }
    if (row.length === 0) {
      throw new Error(errStatus.INVALID_CREDENTIALS);
    }
    return row;
  } catch (err) {
    console.log(err.message);
  } finally {
    if (connection) connection.release();
  }
};

const updateUser = async (id) => {
  const connection = await pool.getConnection();
  try {
    let row;
    if (id !== undefined) {
      [row] = await pool.query(updateUserQuery, [id]);
    } else {
      throw new Error(errStatus.USERID_IS_WRONG);
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
      throw new Error(errStatus.USERID_IS_WRONG);
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
