import passport from 'passport';
import { Strategy as NaverStrategy } from 'passport-naver-v2';

import { getOneUser, createUser } from '../models/user.js';

const naverStrategy = () => {
  passport.use(
    new NaverStrategy(
      {
        clientID: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
        callbackURL: '/api/users/naver_signin/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // NaverProfile에서 필요한 정보를 추출
          const userData = profile._json.response;
          const { id } = userData;
          // 기존 사용자 조회
          const exUser = await getOneUser(id);
          if (exUser) {
            // 사용자 존재 시
            done(null, exUser);
          } else {
            // 사용자 없으면 새로 생성
            const newUser = await createUser(userData);
            done(null, newUser);
          }
        } catch (error) {
          console.log(error);
          done(error);
        }
      }
    )
  );
};

export default naverStrategy;
