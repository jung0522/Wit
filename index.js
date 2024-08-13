import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import morgan from 'morgan'; // 로그 미들웨어 추가
import { successResponse, errorResponse, response, errResponse } from './config/response.js';
import categoryRoutes from './routes/category.js';
import productRoutes from './routes/product.js'; // 필요한 라우트만 가져옴


import { pool } from './config/db-config.js';
import SwaggerUi from 'swagger-ui-express';
import { responseMiddleware } from './config/response-middleware.js'; //응답 미들웨어 불러오기
import noticesRouter from './routes/notices.js';
import searchesRouter from './routes/searches.js';
import usersRouter from './routes/users.js'; 



dotenv.config(); // .env 파일에서 환경변수 로드

const app = express();

app.set('port', 3000);
app.use(cors());
app.use(morgan('dev')); // 개발 환경용 로그 설정
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// 카테고리 및 제품 라우트 사용
app.use('/api', categoryRoutes);
app.use('/api', productRoutes); 

// 예시 라우트
app.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release(); // 연결 해제
    const responseData = response({ isSuccess: true, code: 200, message: 'Database connected successfully!' });
    return res.status(200).json(responseData);
  } catch (err) {
    const errorData = errResponse({ isSuccess: false, code: 500, message: 'Database connection failed' });
    return res.status(500).json(errorData);
  }
});

// Swagger 설정 (주석 해제하여 사용)

// app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs));

app.listen(app.get('port'), async () => {
  console.log(`Server running on port ${app.get('port')}`);

// 기본 응답 셋팅 미들웨어 사용
app.use(responseMiddleware);

// app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs));

// 기본 라우트 설정
app.get('/', (req,res) => {
  res.success('ISSUCCESS',null);
})

app.listen(app.get('port'), () => {
  console.log(`Example app listening on port ${app.get('port')}`);

});

app.use('/notices',noticesRouter); //공지사항 라우트 설정 
app.use('/searches', searchesRouter);
app.use('/users', usersRouter);

(async () => { //DB랑 연결 성공했는지 확인해보는 코드 
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
})();