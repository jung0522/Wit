import CustomError from '../error/customError.js';
import { errStatus } from '../error/errorStatus.js';
import { createUserDto, updateUserDto } from '../dto/userDto.js';
import {
  getAllUser,
  getOneUser,
  getOneUserByPrivateUserKey,
  updateUser,
  deleteUser,
  createUser,
} from '../models/userDao.js';
import { successStatus } from '../config/successStatus.js';
import { response } from '../utils/response.js';

const createUserService = async (userData) => {
  try {
    const createUserData = createUserDto(userData);
    const data = await createUser(createUserData);
    return response(successStatus.CREATE_USER_SUCCESS, data);
  } catch (err) {
    throw new CustomError(
      errStatus.INVALID_USER_DATA.statusCode,
      errStatus.INVALID_USER_DATA.message
    );
  }
};

const getAllUserService = async () => {
  try {
    const data = await getAllUser();
    return response(successStatus.GET_ALL_USERS_SUCCESS, data);
  } catch (err) {
    throw new CustomError(
      errStatus.INTERNAL_SERVER_ERROR.statusCode,
      errStatus.INTERNAL_SERVER_ERROR.message
    );
  }
};

const getOneUserService = async (user_id) => {
  try {
    const data = await getOneUser(user_id);
    if (data === null) {
      throw new CustomError(
        errStatus.USER_ID_IS_WRONG.statusCode,
        errStatus.USER_ID_IS_WRONG.message
      );
    }
    return response(successStatus.GET_ONE_USER_SUCCESS, data);
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else {
      throw new CustomError(
        errStatus.INVALID_CREDENTIALS.statusCode,
        errStatus.INVALID_CREDENTIALS.message
      );
    }
  }
};

const getOneUserByPrivateUserKeyService = async (privateUserKey) => {
  try {
    const data = await getOneUserByPrivateUserKey(privateUserKey);
    if (data === null) {
      throw new CustomError(
        errStatus.USER_ID_IS_WRONG.statusCode,
        errStatus.USER_ID_IS_WRONG.message
      );
    }
    return data;
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else {
      throw new CustomError(
        errStatus.INVALID_CREDENTIALS.statusCode,
        errStatus.INVALID_CREDENTIALS.message
      );
    }
  }
};

const updateUserService = async (userData, user_id) => {
  try {
    const updateUserData = updateUserDto(userData);
    const data = await updateUser(updateUserData, user_id);
    return response(successStatus.UPDATE_USER_SUCCESS, data);
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else {
      throw new CustomError(
        errStatus.USER_ID_IS_WRONG.statusCode,
        errStatus.USER_ID_IS_WRONG.message
      );
    }
  }
};

const deleteUserService = async (user_id) => {
  try {
    await deleteUser(user_id);
    return response(successStatus.WITHDRAW_SUCCESS, null);
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else {
      throw new CustomError(
        errStatus.USER_ID_IS_WRONG.statusCode,
        errStatus.USER_ID_IS_WRONG.message
      );
    }
  }
};

const updateProfileImageService = [
  imageUploader.single('image'),
  async (req, res) => {
    try {
      const { user_id } = req;
      const file = req.file;
      const image = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: file.location,
        user_id: user_id,
      };
      return response(successStatus.UPLOAD_PROFILE_IMAGE_SUCCESS, image);
    } catch (err) {
      throw new CustomError(
        errStatus.UPLOAD_PROFILE_IMAGE_FAIL.statusCode,
        errStatus.UPLOAD_PROFILE_IMAGE_FAIL.message
      );
    }
  },
];

const getProfileImageService = async (req, res) => {
  try {
    const baseUrl =
      'https://wit-bucket-1.s3.ap-northeast-2.amazonaws.com/user-profile-image';
    const { user_id } = req;
    const imageUrl = `${baseUrl}/${user_id}`;
    return response(successStatus.GET_PROFILE_IMAGE_SUCCESS, imageUrl);
  } catch (err) {
    throw new CustomError(
      errStatus.GET_PROFILE_IMAGE_FAIL.statusCode,
      errStatus.GET_PROFILE_IMAGE_FAIL.message
    );
  }
};

export {
  createUserService,
  getAllUserService,
  getOneUserService,
  getOneUserByPrivateUserKeyService,
  updateUserService,
  deleteUserService,
  updateProfileImageService,
  getProfileImageService,
};
