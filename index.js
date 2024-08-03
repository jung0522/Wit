import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import SwaggerUi from 'swagger-ui-express';

import { authRouter } from './routes/auth.js';
import { passportSetup } from './config/passportConfig.js';

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
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport 전략 설정
passportSetup();

app.use('/api/users', authRouter);

// app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs));

app.listen(app.get('port'), () => {
  console.log(`Example app listening on port ${app.get('port')}`);
});
