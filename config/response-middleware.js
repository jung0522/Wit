import { response, errResponse } from './response.js';
import { errStatus } from './errorStatus.js';
import { successStatus } from './successStatus.js';

export const responseMiddleware = (req, res, next) => {
  res.success = (successKey, result) => {
    const successData = successStatus[successKey] || successStatus.ISSUCCESS;
    res.status(successData.status).json(response(successData, result));
  };

  res.error = (errKey) => {
    const errData = errStatus[errKey] || errStatus.INTERNAL_SERVER_ERROR;
    res.status(errData.status).json(errResponse(errData));
  };

  next();
};


