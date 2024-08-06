// 성공 응답 형식
export const successResponse = (res, message, data) => {
  res.status(200).json({
    status: 'success',
    message,
    data,
  });
};

// 에러 응답 형식
export const errorResponse = (res, message, error = null, statusCode = 500) => {
  res.status(statusCode).json({
    status: 'error',
    message,
    error,
  });
};

// 추가된 응답 함수
export const response = (data = {}, result) => {
  const { isSuccess, code, message } = data;

  return {
    isSuccess: isSuccess,
    code: code,
    message: message,
    result: result,
  };
};

export const errResponse = ({ isSuccess, code, message }) => {
  return {
    isSuccess: isSuccess,
    code: code,
    message: message,
  };
};
