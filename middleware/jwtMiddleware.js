import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, verifiedToken) => {
      if (err) {
        console.log(err);
      }
      req.verifiedToken = verifiedToken;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export { authenticateJWT };
