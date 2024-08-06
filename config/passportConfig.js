import passport from 'passport';
import naverStrategy from '../middleware/naverStrategy.js';
import { getOneUser } from '../models/userDao.js';

const passportConfig = () => {
  passport.serializeUser((user, done) => {
    const [userData] = user;
    done(null, userData.user_id);
  });

  passport.deserializeUser((id, done) => {
    getOneUser(id)
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  naverStrategy(); // 네이버 전략 등록
};

export { passportConfig };
