import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import onboardingRouter from './routes/onboarding.js';
import passport from 'passport';
import session from 'express-session';
import morgan from 'morgan';
import { response, errResponse } from './config/response.js';
import categoryRoutes from './routes/category.js';
import productRoutes from './routes/product.js';
import { pool } from './config/db-config.js';
import noticesRouter from './routes/notices.js';
import searchesRouter from './routes/searches.js';
import { userRouter } from './routes/user.js';
import { passportConfig } from './config/passportConfig.js';

import cartRouter from './routes/cartRouter.js'
import mypageRouter from './routes/mypageRouter.js'
import wishlistRouter from './routes/wishlistRouter.js'


dotenv.config();

const app = express();

app.set('port', 3000);
app.use(cors());
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
// 로그 설정
app.use(morgan('combined'));

// Passport 설정
passportConfig();

// 라우트 설정
app.use('/user', userRouter);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/notices', noticesRouter);
app.use('/searches', searchesRouter);
app.use('/onboarding', onboardingRouter);

app.use('/mypage', mypageRouter);
app.use('/product', cartRouter);
app.use('/wishlist', wishlistRouter);



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
