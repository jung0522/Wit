import crypto from 'crypto';

export const generateUserId = (length) => {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
};
