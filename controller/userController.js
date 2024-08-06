import { errStatus } from '../config/errorStatus.js';
import { errResponse, response } from '../config/response.js';
import { successStatus } from '../config/successStatus.js';
import {
  getAllUser,
  getOneUser,
  updateUser,
  deleteUser,
} from '../models/userDao.js';
import { imageUploader } from '../middleware/imageUploader.js';

const getAllUserController = async (req, res) => {
  try {
    const data = await getAllUser();
    res.send(response(successStatus.GET_ALL_USERS_SUCCESS, data));
  } catch (err) {
    res.send(errResponse(errStatus.INTERNAL_SERVER_ERROR));
  }
};

const getOneUserController = async (req, res) => {
  try {
    const { user_id } = req.params;
    const data = await getOneUser(user_id);
    res.send(response(successStatus.GET_ONE_USER_SUCCESS, data));
  } catch (err) {
    res.send(errResponse(errStatus.USER_ID_IS_WRONG));
  }
};

const updateUserController = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log('유저 데이터(이미지 제외)', req.body);
    const data = await updateUser(req.body, user_id);
    res.send(response(successStatus.UPDATE_USER_SUCCESS, data));
  } catch (err) {
    res.send(errResponse(errStatus.USER_ID_IS_WRONG));
  }
};

const deleteUserController = async (req, res) => {
  try {
    const { user_id } = req.body;
    const data = await deleteUser(user_id);
    res.send(response(successStatus.WITHDRAW_SUCCESS, data));
  } catch (err) {
    res.send(errResponse(errStatus.USER_ID_IS_WRONG));
  }
};

const updateProfileImage = [
  imageUploader.single('image'),
  (req, res) => {
    try {
      // 업로드가 성공적으로 완료된 경우
      const { user_id } = req.params;
      const file = req.file;
      const image = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: file.location, // S3에 업로드된 파일의 URL
        user_id: user_id,
      };
      res.send(response(successStatus.UPLOAD_PROFILE_IMAGE_SUCCESS, image));
    } catch (err) {
      res.send(errResponse(errStatus.UPLOAD_PROFILE_IMAGE_FAIL));
    }
  },
];

const getProfileImage = async (req, res) => {
  try {
    const baseUrl =
      'https://wit-bucket-1.s3.ap-northeast-2.amazonaws.com/user-profile-image';
    const { user_id } = req.params;
    const imageUrl = `${baseUrl}/${user_id}`;
    res.send(response(successStatus.GET_PROFILE_IMAGE_SUCCESS, imageUrl));
  } catch (err) {
    res.send(errResponse(errStatus.GET_PROFILE_IMAGE_FAIL));
  }
};

export {
  getAllUserController,
  getOneUserController,
  updateUserController,
  deleteUserController,
  updateProfileImage,
  getProfileImage,
};
