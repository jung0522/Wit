import express from 'express';
import passport from 'passport';

export const authRouter = express.Router();

// 네이버로 로그인하는 라우터
authRouter.get(
  '/naver_signin',
  passport.authenticate('naver', {
    authType: 'reprompt',
  })
);

// 위에서 네이버 서버 로그인이 되면, 네이버 redirect url 설정에 따라 이쪽 라우터로 오게 된다.
authRouter.get(
  '/naver_signin/callback',
  passport.authenticate('naver', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);
