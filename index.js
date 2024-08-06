import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import SwaggerUi from 'swagger-ui-express';

import { userRouter } from './routes/user.js';
import { passportConfig } from './config/passportConfig.js';

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000);
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

// Passport 설정
passportConfig();

app.use('/api/users', userRouter);

// app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs));

app.listen(app.get('port'), () => {
  console.log(`Example app listening on port ${app.get('port')}`);
});
