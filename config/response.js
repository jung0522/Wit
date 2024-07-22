const response = (data = {}, result) => {
  const { isSuccess, code, message } = data;

  return {
    isSuccess: isSuccess,
    code: code,
    message: message,
    result: result,
  };
};

const errResponse = ({ isSuccess, code, message }) => {
  return {
    isSuccess: isSuccess,
    code: code,
    message: message,
  };
};

export { response, errResponse };
