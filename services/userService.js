import { BaseError } from '../config/error.js';
import { errResponse, response } from '../config/response.js';
import { createUserDto, updateUserDto } from '../dto/userDto.js';
import { errStatus } from '../config/errorStatus.js';
import { successStatus } from '../config/successStatus.js';
import {
  getOneUser,
  getOneUserByPrivateUserKey,
  createUser,
  updateUser,
  deleteUser,
} from '../models/userDao.js';
import { imageUploader } from '../middleware/imageUploader.js';

const createUserService = async (userData) => {
  if (Object.keys(userData).length === 0 || !userData) {
    throw new BaseError(errResponse(errStatus.INVALID_USER_DATA));
  }

  const createUserData = createUserDto(userData);
  const data = await createUser(createUserData);
  return data;
};

const getOneUserService = async (user_id) => {
  if (!user_id) {
    throw new BaseError(errStatus.USER_ID_IS_WRONG);
  }

  const data = await getOneUser(user_id);
  return data;
};

const getOneUserByPrivateUserKeyService = async (privateUserKey) => {
  if (!privateUserKey) {
    throw new BaseError(errStatus.USER_PRIVATE_KEY_IS_WRONG);
  }

  const data = await getOneUserByPrivateUserKey(privateUserKey);
  return data;
};

const updateUserService = async (userData, user_id) => {
  if (Object.keys(userData).length === 0 || !userData) {
    throw new BaseError(errStatus.INVALID_USER_DATA);
  } else if (!user_id) {
    throw new BaseError(errStatus.USER_ID_IS_WRONG);
  }

  const updateUserData = updateUserDto(userData);
  const data = await updateUser(updateUserData, user_id);
  return data;
};

const deleteUserService = async (user_id) => {
  if (!user_id) {
    throw new BaseError(errStatus.USER_ID_IS_WRONG);
  }
  await deleteUser(user_id);
};

const updateProfileImageService = [
  imageUploader.single('image'),
  (req, res) => {
    try {
      const { user_id, file } = req;

      const image = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: file.location,
        user_id: user_id,
      };
      res.send(response(successStatus.UPLOAD_PROFILE_IMAGE_SUCCESS, image));
    } catch (err) {
      res.send(errResponse(errStatus.UPLOAD_PROFILE_IMAGE_FAIL));
    }
  },
];

const getProfileImageService = async (req, res) => {
  try {
    const baseUrl =
      'https://wit-bucket-1.s3.ap-northeast-2.amazonaws.com/user-profile-image';
    const { user_id } = req;
    const imageUrl = `${baseUrl}/${user_id}`;
    res.send(response(successStatus.GET_PROFILE_IMAGE_SUCCESS, imageUrl));
  } catch (err) {
    res.send(errResponse(errStatus.GET_PROFILE_IMAGE_FAIL));
  }
};

export {
  createUserService,
  getOneUserService,
  getOneUserByPrivateUserKeyService,
  updateUserService,
  deleteUserService,
  updateProfileImageService,
  getProfileImageService,
};
