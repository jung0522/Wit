import { errStatus } from '../config/errorStatus.js';
import { errResponse, response } from '../config/response.js';
import { successStatus } from '../config/successStatus.js';
import {
  getAllUser,
  getOneUser,
  updateUser,
  deleteUser,
} from '../models/userDao.js';

const getAllUserController = async (req, res) => {
  try {
    const data = await getAllUser();
    return res.send(response(successStatus.GET_ALL_USERS_SUCCESS, data));
  } catch (err) {
    res.send(errResponse(errStatus.INTERNAL_SERVER_ERROR));
  }
};

const getOneUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getOneUser(id);
    return res.send(response(successStatus.GET_ONE_USER_SUCCESS, data));
  } catch (err) {
    res.send(errResponse(errStatus.USER_ID_IS_WRONG));
  }
};

const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await updateUser(req.body, id);
    return res.send(response(successStatus.UPDATE_USER_SUCCESS, data));
  } catch (err) {
    res.send(errResponse(errStatus.USER_ID_IS_WRONG));
  }
};

const deleteUserController = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await deleteUser(id);
    return res.send(response(successStatus.WITHDRAW_SUCCESS, data));
  } catch (err) {
    res.send(errResponse(errStatus.USER_ID_IS_WRONG));
  }
};

export {
  getAllUserController,
  getOneUserController,
  updateUserController,
  deleteUserController,
};
