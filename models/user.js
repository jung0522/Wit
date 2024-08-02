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
  try {
    const connection = await pool.getConnection();
    let row;
    [row] = await pool.query(createUserQuery, [
      userData.id,
      userData.name,
      userData.nickname,
      userData.gender,
      userData.age,
      userData.birthday,
    ]);
    connection.release();
    return row;
  } catch (err) {
    throw new BaseError(errStatus.BAD_REQUEST);
  }
};

const getAllUser = async () => {
  try {
    const connection = await pool.getConnection();
    let row;
    [row] = await pool.query(findAllUserQuery);
    connection.release();
    return row;
  } catch (err) {
    throw new BaseError(errStatus.INTERNAL_SERVER_ERROR);
  }
};

const getOneUser = async (id) => {
  try {
    const connection = await pool.getConnection();
    let row;
    if (id !== undefined && !NaN(Number(id))) {
      [row] = await pool.query(findOneUserQuery, [id]);
    } else {
      throw new Error(errStatus.USERID_IS_WRONG);
    }
    connection.release();
    return row;
  } catch (err) {
    throw new BaseError(errStatus.INTERNAL_SERVER_ERROR);
  }
};

const updateUser = async (id) => {
  try {
    const connection = await pool.getConnection();
    let row;
    if (id !== undefined && !NaN(Number(id))) {
      [row] = await pool.query(updateUserQuery, [id]);
    } else {
      throw new Error(errStatus.USERID_IS_WRONG);
    }
    connection.release();
    return row;
  } catch (err) {
    throw new Error(errStatus.INTERNAL_SERVER_ERROR);
  }
};

const deleteUser = async (id) => {
  try {
    const connection = await pool.getConnection();
    let row;
    if (id !== undefined && !NaN(Number(id))) {
      [row] = await pool.query(deleteUserQuery, [id]);
    } else {
      throw new Error(errStatus.USERID_IS_WRONG);
    }
    connection.release();
    return row;
  } catch (err) {
    throw new Error(errStatus.INTERNAL_SERVER_ERROR);
  }
};

export { createUser, getAllUser, getOneUser, updateUser, deleteUser };
