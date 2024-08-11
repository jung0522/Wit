import passport from 'passport';
import { Strategy as NaverStrategy } from 'passport-naver-v2';

import { getOneUser, createUser } from '../models/userDao.js';
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
        callbackURL: '/api/users/naver_signin/callback',
      },
      // 여기에 있는 accessToken, refreshToken은 네이버 api를 위한 토큰임 (jwt 아님)
      async (accessToken, refreshToken, profile, done) => {
        try {
          // NaverProfile에서 필요한 정보를 추출
          const userData = profile._json.response;
          const { id } = userData;
          // 기존 사용자 조회
          const exUser = await getOneUser(id);
          if (exUser) {
            // 사용자 존재 시
            const accessToken = generateToken(exUser);
            const refreshToken = await generateRefreshToken(exUser);
            return done(null, exUser, {
              accessToken,
              refreshToken,
            });
          } else {
            // 사용자 없으면 새로 생성
            const newUser = await createUser(userData);
            const accessToken = generateToken(newUser);
            const refreshToken = generateRefreshToken(newUser);
            console.log('access', accessToken);
            console.log('refresh', refreshToken);
            return done(null, newUser, {
              accessToken,
              refreshToken,
            });
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
