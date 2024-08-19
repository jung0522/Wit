import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { errResponse, response } from '../config/response.js';
import { errStatus } from '../config/errorStatus.js';
import { successStatus } from '../config/successStatus.js';
import redisClient from '../config/redis-config.js';
dotenv.config();

const generateToken = (user) => {
  let userId = String(user.user_id);
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_KEY,
    // access 토큰 유효 기간 설정
    {
      expiresIn: '1h',
    }
  );
  console.log('accessToken: ', accessToken);
  return accessToken;
};

const generateRefreshToken = (user) => {
  let userId = String(user.user_id);
  console.log('refresh userId', userId);
  console.log({ id: userId });
  const refreshToken = jwt.sign(
    { id: userId }, // jwt.sign의 첫 번째 인자로 payload 전달
    process.env.JWT_REFRESH_SECRET_KEY,
    {
      expiresIn: '14d',
    }
  );

  // redis에 14일 만료기한으로 저장
  redisClient.SETEX(userId, 1209600, refreshToken);
  console.log('refresh: ', refreshToken);
  return refreshToken;
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
  const { user_id } = req;
  try {
    await redisClient.del(user_id);
    return res.send(response(successStatus.LOGOUT_SUCCESS));
  } catch (err) {
    return res.send(errResponse(errStatus.LOGOUT_FAILURE));
  }
};

const decodeAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user_id = decodedToken.id; // 유저 정보를 req 객체에 저장
      console.log(req.user_id);
      next(); // 다음 middleware로 넘어감
    } catch (err) {
      return res.send(errResponse(errStatus.TOKEN_VERIFICATION_FAILURE));
    }
  } else {
    return res.send(errResponse(errStatus.AUTHENTICATION_FAILED));
  }
};

export {
  generateToken,
  generateRefreshToken,
  refreshAccessToken,
  logout,
  decodeAccessToken,
};
