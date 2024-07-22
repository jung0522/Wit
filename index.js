import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import SwaggerUi from 'swagger-ui-express';

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs));

app.listen(app.get('port'), () => {
  console.log(`Example app listening on port ${app.get('port')}`);
});
