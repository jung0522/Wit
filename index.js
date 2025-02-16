import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import passport from 'passport';
import session from 'express-session';
import morgan from 'morgan';
import categoryRoutes from './routes/category.js';
import productRoutes from './routes/product.js';

import { noticeRouter } from './routes/notices.js';
import searchesRouter from './routes/searches.js';
import { userRouter } from './routes/user.js';
import { passportConfig } from './config/passportConfig.js';
import { onboardingRouter } from './routes/onboarding.js';
import cartRouter from './routes/cartRouter.js';
import mypageRouter from './routes/mypageRouter.js';
import wishlistRouter from './routes/wishlistRouter.js';
import homeRouter from './routes/homeRouter.js';

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
app.use('/notices', noticeRouter);
app.use('/searches', searchesRouter);
app.use('/onboarding', onboardingRouter);
app.use('/mypage', mypageRouter);
app.use('/product', cartRouter);
app.use('/wishlist', wishlistRouter);
app.use('/home', homeRouter);

// 서버 시작
app.listen(app.get('port'), async () => {
  console.log(`Server running on port ${app.get('port')}`);
});
