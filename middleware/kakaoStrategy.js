import passport from 'passport';

import { Strategy as KakaoStrategy } from 'passport-kakao';
import { getOneUser, createUser } from '../models/userDao.js';
import { errStatus } from '../config/errorStatus.js';
import { generateUserId } from './generateUserId.js';
import {
  generateToken,
  generateRefreshToken,
} from '../middleware/jwtMiddleware.js';

const kakaoStrategy = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_RESTAPI_KEY,
        callbackURL: '/api/users/kakao_signin/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const id = generateUserId(43);
          const rawUserData = profile._json.kakao_account;
          // 기존 사용자 조회
          const exUser = await getOneUser(id);
          if (exUser) {
            // 사용자 존재 시
            const accessToken = generateToken(exUser);
            const refreshToken = generateRefreshToken(exUser);
            const { user_id } = exUser;
            return done(null, exUser, {
              user_id,
              accessToken,
              refreshToken,
            });
          } else {
            // 사용자 없으면 새로 생성
            const {
              profile: { nickname },
              name,
              age_range,
              birthday,
              gender,
            } = rawUserData;

            const userData = {
              id,
              nickname,
              name,
              age: age_range,
              birthday,
              gender,
              social_login: 'kakao',
            };
            const newUser = await createUser(userData);
            const { user_id } = newUser;
            const accessToken = generateToken(newUser);
            const refreshToken = generateRefreshToken(newUser);
            return done(null, newUser, { user_id, accessToken, refreshToken });
          }
        } catch (error) {
          console.log(error);
          done(error, false, {
            status: errStatus.INTERNAL_SERVER_ERROR,
          });
        }
      }
    )
  );
};

export default kakaoStrategy;
