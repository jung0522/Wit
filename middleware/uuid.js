import { v4 } from 'uuid'; // uuid4 사용

// uuid 생성
export const createUUID = () => {
  const tokens = v4().split('-');
  return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
};
