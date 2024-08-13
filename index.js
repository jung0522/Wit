import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import passport from 'passport';
import session from 'express-session';
import morgan from 'morgan'; // 로그 미들웨어 추가
import { response, errResponse } from './config/response.js';
import categoryRoutes from './routes/category.js';
import productRoutes from './routes/product.js'; // 필요한 라우트만 가져옴
import { pool } from './config/db-config.js';
import { responseMiddleware } from './config/response-middleware.js'; //응답 미들웨어 불러오기
import noticesRouter from './routes/notices.js';
import searchesRouter from './routes/searches.js';
// 놀랍게도 user's'임 ㅋㅋㅋ -지환-
import usersRouter from './routes/users.js';
import { userRouter } from './routes/user.js';
import { passportConfig } from './config/passportConfig.js';

dotenv.config();

const app = express();

app.set('port', 3000);
app.use(cors());
app.use(morgan('dev')); // 개발 환경용 로그 설정
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport 설정
passportConfig();

// 라우트 설정
app.use('/api/users', userRouter);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/notices', noticesRouter);
app.use('/searches', searchesRouter);
app.use('/users', usersRouter);

// 기본 응답 셋팅 미들웨어 사용
app.use(responseMiddleware);

// 예시 라우트
app.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release(); // 연결 해제
    const responseData = response({
      isSuccess: true,
      code: 200,
      message: 'Database connected successfully!',
    });
    return res.status(200).json(responseData);
  } catch (err) {
    const errorData = errResponse({
      isSuccess: false,
      code: 500,
      message: 'Database connection failed',
    });
    return res.status(500).json(errorData);
  }
});

// 서버 시작
app.listen(app.get('port'), async () => {
  console.log(`Server running on port ${app.get('port')}`);

  // DB 연결 확인
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
});
