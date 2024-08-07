import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ id: user.user_id }, process.env.JWT_SECRET_KEY, {
    // access 토큰 유효 기간 설정
    expiresIn: '1h',
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET_KEY, {
    // refresh 토큰의 유효 기간 설정
    expiresIn: '14d',
  });
};

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, verifiedToken) => {
      if (err) {
        res.sendStatus(403);
      }
      req.verifiedToken = verifiedToken;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export { authenticateJWT, generateToken, generateRefreshToken };
