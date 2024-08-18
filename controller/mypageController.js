// controllers/mypageController.js
import { getUserProfile, updateUserProfile, deleteUser } from '../services/mypageService.js';
import { response, errResponse } from '../config/response.js';
import { errStatus } from '../config/errorStatus.js';
import { successStatus } from '../config/successStatus.js';

export const getProfile = async (req, res) => {
  const userId = req.params.userId;

  try {
    const userProfile = await getUserProfile(userId);

    if (!userProfile) {
      return res.status(errStatus.USER_NOT_FOUND.status).json(errResponse(errStatus.USER_NOT_FOUND));
    }

    return res.status(successStatus.GET_USER_PROFILE_SUCCESS.status).json(
      response(successStatus.GET_USER_PROFILE_SUCCESS, userProfile)
    );
  } catch (error) {
    console.error(error);
    return res.status(errStatus.INTERNAL_SERVER_ERROR.status).json(errResponse(errStatus.INTERNAL_SERVER_ERROR));
  }
};

// 사용자 프로필 수정 함수 추가
export const updateProfile = async (req, res) => {
  const userId = req.params.userId;
  const { username, usernickname, gender, birth } = req.body;

  try {
    const updatedProfile = await updateUserProfile(userId, { username, usernickname, gender, birth });

    if (!updatedProfile) {
      return res.status(errStatus.USER_NOT_FOUND.status).json(errResponse(errStatus.USER_NOT_FOUND));
    }

    return res.status(successStatus.UPDATE_USER_PROFILE_SUCCESS.status).json(
      response(successStatus.UPDATE_USER_PROFILE_SUCCESS, updatedProfile)
    );
  } catch (error) {
    console.error(error);
    return res.status(errStatus.INTERNAL_SERVER_ERROR.status).json(errResponse(errStatus.INTERNAL_SERVER_ERROR));
  }
};

// 사용자 탈퇴 함수
export const deleteUserProfile = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const result = await deleteUser(userId);
  
      if (!result) {
        return res.status(errStatus.USER_NOT_FOUND.status).json(errResponse(errStatus.USER_NOT_FOUND));
      }
  
      return res.status(successStatus.WITHDRAW_SUCCESS.status).json(
        response(successStatus.WITHDRAW_SUCCESS, { userId })
      );
    } catch (error) {
      console.error(error);
      return res.status(errStatus.INTERNAL_SERVER_ERROR.status).json(errResponse(errStatus.INTERNAL_SERVER_ERROR));
    }
  };