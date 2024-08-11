import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { errResponse, response } from '../config/response.js';
import { errStatus } from '../config/errorStatus.js';
import { successStatus } from '../config/successStatus.js';
import redisClient from '../config/redis-config.js';
dotenv.config();

const generateToken = (user) => {
  const userId = String(user[0].user_id);
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_KEY,
    // access 토큰 유효 기간 설정
    {
      expiresIn: '1h',
    }
  );
  return accessToken;
};

const generateRefreshToken = (user) => {
  const userId = String(user[0].user_id);

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET_KEY,
    // refresh 토큰의 유효 기간 설정
    {
      expiresIn: '14d',
    }
  );
  // redis에 14일 만료기한으로 저장
  redisClient.SETEX(userId, 1209600, refreshToken);

  return refreshToken;
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

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.send(errResponse(errStatus.REFRESH_TOKEN_MISIING));
  }
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY
    );
    const storedRefreshToken = await redisClient.get(decoded.id);

    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      return res.send(errResponse(errStatus.INVALID_REFRESH_TOKEN));
    }
    const newAccessToken = generateToken({ user_id: decoded.id });
    return res.send(
      response(successStatus.TOKEN_REFRESH_SUCCESS, newAccessToken)
    );
  } catch (err) {
    return res.send(errResponse(errStatus.REFRESH_TOKEN_EXPIRED));
  }
};

const logout = async (req, res) => {
  const { user_id } = req.body;
  try {
    await redisClient.del(user_id);
    return res.send(response(successStatus.LOGOUT_SUCCESS));
  } catch (err) {
    return res.send(errResponse(errStatus.LOGOUT_FAILURE));
  }
};

export {
  authenticateJWT,
  generateToken,
  generateRefreshToken,
  refreshAccessToken,
  logout,
};
