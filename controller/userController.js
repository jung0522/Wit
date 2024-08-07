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
    console.log('확인된 토큰', req.verifiedToken);
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
    res.send(errResponse(errStatus.INVALID_CREDENTIALS));
  }
};

const updateUserController = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userData = req.body;
    const data = await updateUser(userData, user_id);
    // data가 아래 형식으로 들어옴 좀 더 응답 메시지 좋게 만들려면 어떻게 해야할까?
    // ResultSetHeader {
    //   fieldCount: 0,
    //   affectedRows: 1,
    //   insertId: 0,
    //   info: 'Rows matched: 1  Changed: 0  Warnings: 0',
    //   serverStatus: 2,
    //   warningStatus: 0,
    //   changedRows: 0
    // }
    res.send(response(successStatus.UPDATE_USER_SUCCESS, data));
  } catch (err) {
    res.send(errResponse(errStatus.USER_ID_IS_WRONG));
  }
};

const deleteUserController = async (req, res) => {
  try {
    const { user_id } = req.params;
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
