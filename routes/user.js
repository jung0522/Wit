import express from 'express';
import passport from 'passport';
import { response } from '../config/response.js';
import { successStatus } from '../config/successStatus.js';
import { getRecentSearches } from '../models/searchesDao.js';
import {
  getAllUserController,
  getOneUserController,
  updateUserController,
  deleteUserController,
  updateProfileImage,
  getProfileImage,
} from '../controller/userController.js';

import {
  decodeAccessToken,
  logout,
  refreshAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
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
    const { user_id, accessToken, refreshToken } = req.authInfo;
    req.session.accessToken = accessToken;
    const data = { user_id, accessToken, refreshToken };
    const dataObj = response(successStatus.NAVER_LOGIN_SUCCESS, data);
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>wit-login-success</title>
        </head>
        <body>
          <script>
            window.opener.postMessage(${JSON.stringify(dataObj)}, '*');
          </script>
        </body>
      </html>
    `);
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
    const { user_id, accessToken, refreshToken } = req.authInfo;
    req.session.accessToken = accessToken;
    const data = { user_id, accessToken, refreshToken };
    const dataObj = response(successStatus.NAVER_LOGIN_SUCCESS, data);
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>wit-login-success</title>
        </head>
        <body>
          <script>
            window.opener.postMessage(${JSON.stringify(dataObj)}, '*');
          </script>
        </body>
      </html>
    `);
  }
);

userRouter.get('/logout', decodeAccessToken, logout);

// 회원 정보 모두 조회 (이미지 제외)
userRouter.route('/all').get(decodeAccessToken, getAllUserController);

// 회원 탈퇴
userRouter.delete('/withdraw', deleteUserController);

userRouter.post('/refresh_token', refreshAccessToken);

userRouter
  .route('/')
  // 회원 정보 조회 (이미지 제외)
  .get(decodeAccessToken, getOneUserController)
  // 회원 정보 수정 (이미지 제외)
  .post(decodeAccessToken, updateUserController);

// 회원 프로필 이미지 관련 라우터
userRouter
  .route('/profile_image')
  // 회원 프로필 이미지 조회
  .get(decodeAccessToken, getProfileImage)
  // 회원 프로필 이미지 수정, 업로드
  .post(decodeAccessToken, updateProfileImage);

userRouter.post('/check_access', verifyAccessToken);

userRouter.post('/check_refresh', verifyRefreshToken);

// 개인 최근 검색어 확인 하경님이 수정해주세요
userRouter.get('/:userId/recent-searches', async (req, res) => {
  const { userId } = req.params;

  try {
    const keywords = await getRecentSearches(userId);
    res.send(response(successStatus.RECENT_SEARCHES_SUCCESS, keywords));
  } catch (err) {
    console.log(err);
    res.send(errResponse(errStatus.RECENT_SEARCHES_FAILED));
  }
});
