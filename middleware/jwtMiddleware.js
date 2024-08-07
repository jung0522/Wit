import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { errResponse } from '../config/response.js';
import { errStatus } from '../config/errorStatus.js';
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
        return res.send(errResponse(errStatus.TOKEN_VERIFICATION_FAILURE));
      }
      req.verifiedToken = verifiedToken;
      next();
    });
  } else {
    return res.send(errResponse(errStatus.AUTHENTICATION_FAILED));
  }
};

export { authenticateJWT, generateToken, generateRefreshToken };
