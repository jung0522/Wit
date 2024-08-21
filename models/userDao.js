import { BaseError } from '../config/BaseError.js';
import { pool } from '../config/db-config.js';
import { errStatus } from '../config/errorStatus.js';
import { redisClient } from '../config/redis-config.js';
import { createUserDto, updateUserDto } from '../dto/userDto.js';
import {
  createUserQuery,
  findUserRealIdQuery,
  findOneUserQuery,
  updateUserQuery,
  deleteUserQuery,
} from './userQuery.js';

const executeQuery = async (query, params, pass) => {
  const connection = await pool.getConnection();

  const [result] = await connection.query(query, params);
  connection.release();
  if (result.length === 0 && !pass) {
    throw new BaseError(errStatus.DATABASE_ERROR);
  }
  return result;
};

const createUser = async (userData) => {
  const createUser = createUserDto(userData);
  let { id, name, nickname, gender, age, birthday, social_login } = createUser;
  birthday = `2002${birthday}`;
  const row = await executeQuery(createUserQuery, [
    id,
    name,
    nickname,
    gender,
    age,
    birthday,
    social_login,
  ]);

  if (row) {
    const realIdData = await executeQuery(findUserRealIdQuery, [id]);
    const realId = realIdData[0].user_id;
    const result = await executeQuery(findOneUserQuery, [realId]);
    return result[0];
  }
};

const getOneUser = async (id) => {
  const row = await executeQuery(findOneUserQuery, [id], true);
  return row[0];
};

const getOneUserByPrivateUserKey = async (privateUserKey) => {
  const row = await executeQuery(findUserRealIdQuery, [privateUserKey], true);
  return row[0];
};

const updateUser = async (userData, user_id) => {
  const updateUser = updateUserDto(userData);
  const { username, usernickname, gender, age, birth } = updateUser;
  const row = await executeQuery(updateUserQuery, [
    username,
    usernickname,
    gender,
    age,
    birth,
    user_id,
  ]);
  if (row.warningStatus === 1) {
    throw new BaseError(errStatus.DATABASE_ERROR);
  }
  const result = await executeQuery(findOneUserQuery, [user_id]);
  return result[0];
};

const deleteUser = async (id) => {
  const row = await executeQuery(deleteUserQuery, [id]);
  await redisClient.del(id);
  return row;
};

export {
  createUser,
  getOneUser,
  getOneUserByPrivateUserKey,
  updateUser,
  deleteUser,
};
