import passport from 'passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';

const kakaoStrategy = () => {
  passport.use(
    new KakaoStrategy({
      clientID: process.env.KAKAO_RESTAPI_KEY,
      callback: '/api/users/kakao_signin/callback',
    }),
    async (accessToken, refreshToken, profile, done) => {
      console.log('kakao profile', profile);
      try {
        const exUser = await getOneUser(id);
      } catch (error) {
        console.log(error);
        done(error, false, {
          status: errStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  );
};

export default kakaoStrategy;
