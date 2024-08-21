import passport from 'passport';
import { Strategy as NaverStrategy } from 'passport-naver-v2';

import { getOneUserByPrivateUserKey, createUser } from '../models/userDao.js';
import { errStatus } from '../config/errorStatus.js';
import {
  generateToken,
  generateRefreshToken,
} from '../middleware/jwtMiddleware.js';

const naverStrategy = () => {
  passport.use(
    new NaverStrategy(
      {
        clientID: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
        // 네이버는 배포시 ip 정확히 박아줘야함
        callbackURL: 'http://43.202.194.145/user/naver_signin/callback',
      },
      // 여기에 있는 accessToken, refreshToken은 네이버 api를 위한 토큰임 (jwt 아님)
      async (accessToken, refreshToken, profile, done) => {
        try {
          // NaverProfile에서 필요한 정보를 추출
          let userData = profile._json.response;
          const { id } = userData;
          // 기존 사용자 조회
          const privateUserKey = id;
          const exUser = await getOneUserByPrivateUserKey(privateUserKey);
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
            userData.birthday = userData.birthday.split('-').join('');
            userData.social_login = 'naver';
            const newUser = await createUser(userData);
            const accessToken = generateToken(newUser);
            const refreshToken = generateRefreshToken(newUser);
            const { user_id } = newUser;
            return done(null, newUser, { user_id, accessToken, refreshToken });
          }
        } catch (error) {
          console.log(error);
          return done(error, false, {
            status: errStatus.INTERNAL_SERVER_ERROR,
          });
        }
      }
    )
  );
};

export default naverStrategy;
