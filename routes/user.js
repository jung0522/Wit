import express from 'express';
import passport from 'passport';
import { response } from '../config/response.js';
import { successStatus } from '../config/successStatus.js';

import {
  getAllUserController,
  getOneUserController,
  updateUserController,
  deleteUserController,
  updateProfileImage,
  getProfileImage,
} from '../controller/userController.js';

import {
  authenticateJWT,
  logout,
  refreshAccessToken,
} from '../middleware/jwtMiddleware.js';

export const userRouter = express.Router();

// 네이버 로그인 라우터
userRouter.get(
  '/naver_signin',
  passport.authenticate('naver', { authType: 'reprompt' })
);

// 네이버 로그인 콜백 라우터
userRouter.get(
  '/naver_signin/callback',
  passport.authenticate('naver', { failureRedirect: '/naver_signin' }),
  (req, res) => {
    const { accessToken, refreshToken } = req.authInfo;
    req.session.accessToken = accessToken;

    const data = { accessToken, refreshToken };
    res.send(response(successStatus.NAVER_LOGIN_SUCCESS, data));
  }
);

userRouter.get(
  '/kakao_signin',
  passport.authenticate('kakao', { authType: 'reprompt' })
);

userRouter.get(
  '/kakao_signin/callback',
  passport.authenticate('kakao', { failureRedirect: '/kakao_signin' }),
  (req, res) => {
    const { accessToken, refreshToken } = req.authInfo;
    req.session.accessToken = accessToken;

    const data = { accessToken, refreshToken };
    res.send(response(successStatus.KAKAO_LOGIN_SUCCESS, data));
  }
);

userRouter.post('/logout', authenticateJWT, logout);

// 회원 정보 모두 조회 (이미지 제외)
userRouter.route('/').get(authenticateJWT, getAllUserController);

// 회원 탈퇴
userRouter.delete('/withdraw/:user_id', authenticateJWT, deleteUserController);

userRouter.post('/refresh_token', refreshAccessToken);

userRouter
  .route('/:user_id')
  // 회원 정보 조회 (이미지 제외)
  .get(authenticateJWT, getOneUserController)
  // 회원 정보 수정 (이미지 제외)
  .post(authenticateJWT, updateUserController);

// 회원 프로필 이미지 관련 라우터
userRouter
  .route('/profile_image/:user_id')
  // 회원 프로필 이미지 조회
  .get(authenticateJWT, getProfileImage)
  // 회원 프로필 이미지 수정, 업로드
  .post(authenticateJWT, updateProfileImage);
