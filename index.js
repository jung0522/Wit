import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import SwaggerUi from 'swagger-ui-express';
import { pool } from './config/db-config.js';
import { successResponse, errorResponse, response, errResponse } from './config/response.js';
import categoryRoutes from './routes/category.js';
import productRoutes from './routes/product.js'; // 필요한 라우트만 가져옴

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// 카테고리 및 제품 라우트 사용
app.use('/api', categoryRoutes);
app.use('/api', productRoutes); // product 라우트 사용

// Swagger 설정 (주석 해제하여 사용)
// app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs));

app.listen(app.get('port'), async () => {
  console.log(`Server running on port ${app.get('port')}`);
});
