import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { pool } from './config/db-config.js';
import SwaggerUi from 'swagger-ui-express';
import noticesRouter from './routes/notices.js';
import searchesRouter from './routes/searches.js';
import usersRouter from './routes/users.js'; 
import onboardingRouter from './routes/onboarding.js'


dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



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
app.use('/onboarding', onboardingRouter);

(async () => { //DB랑 연결 성공했는지 확인해보는 코드 
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
})();