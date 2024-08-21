import { response, errResponse } from '../config/response.js';

import { successStatus } from '../config/successStatus.js';
import { BaseError } from '../config/error.js';
import {
  getOneUserService,
  updateUserService,
  deleteUserService,
} from '../services/userService.js';

const getOneUserController = async (req, res) => {
  try {
    const { user_id } = req;
    const data = await getOneUserService(user_id);
    res.send(response(successStatus.GET_ONE_USER_SUCCESS, data));
  } catch (err) {
    if (err instanceof BaseError) {
      res.send(errResponse(err.data));
    }
  }
};

const updateUserController = async (req, res) => {
  try {
    const { user_id } = req;
    const userData = req.body;
    const data = await updateUserService(userData, user_id);
    res.send(response(successStatus.UPDATE_USER_SUCCESS, data));
  } catch (err) {
    if (err instanceof BaseError) {
      res.send(errResponse(err.data));
    }
  }
};

const deleteUserController = async (req, res) => {
  try {
    const { user_id } = req;
    await deleteUserService(user_id);
    res.send(response(successStatus.WITHDRAW_SUCCESS, null));
  } catch (err) {
    if (err instanceof BaseError) {
      res.send(errResponse(err.data));
    }
  }
};

export { getOneUserController, updateUserController, deleteUserController };
