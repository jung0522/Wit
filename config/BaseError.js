// config/BaseError.js
export class BaseError extends Error {
    constructor({ status, code, message, isSuccess }) {
      super(message);
      this.status = status;
      this.code = code;
      this.isSuccess = isSuccess;
    }
  }
  