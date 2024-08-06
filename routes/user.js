import express from 'express';
import passport from 'passport';
import { response } from '../config/response.js';
import { successStatus } from '../config/successStatus.js';

import {
  getAllUserController,
  getOneUserController,
  updateUserController,
  deleteUserController,
} from '../controller/userController.js';

export const userRouter = express.Router();

// 네이버로 로그인하는 라우터
userRouter.get(
  '/naver_signin',
  passport.authenticate('naver', {
    authType: 'reprompt',
  })
);

// 네이버 서버 로그인이 되면, 네이버 redirect URL 설정에 따라 이쪽 라우터로 오게 된다.
userRouter.get(
  '/naver_signin/callback',
  passport.authenticate('naver', { failureRedirect: '/naver_signin' }),
  (req, res) => {
    // req.authInfo를 통해 상태 코드, 메시지, 액세스 토큰, 리프레시 토큰에 접근
    const { accessToken, refreshToken } = req.authInfo;
    const data = {
      accessToken,
      refreshToken,
    };
    // 클라이언트에 응답을 보냄
    res.send(response(successStatus.LOGIN_NAVER_SUCCESS, data));
  }
);
// 회원탈퇴
userRouter.delete('withdraw/:user_id', deleteUserController);
// 회원 정보 조회
userRouter.get('/:user_id', getOneUserController);
// 회원 정보 수정 (이미지 제외)
userRouter.get('/:user_id', updateUserController);
