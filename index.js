import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan'; // 로그 미들웨어 추가
import SwaggerUi from 'swagger-ui-express';
import { pool } from './config/db-config.js';
import { successResponse, errorResponse, response, errResponse } from './config/response.js';
import categoryRoutes from './routes/category.js';
import productRoutes from './routes/product.js'; // 필요한 라우트만 가져옴


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
});
