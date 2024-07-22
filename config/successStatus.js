import { StatusCodes } from 'http-status-codes';

export const successStatus = {
  // success
  ISSUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: '2000',
    message: 'success!',
  },
  TOKEN_VERIFICATION_SUCCESS: {
    isSuccess: true,
    code: 'TOKEN200',
    message: 'JWT 토큰 검증 성공',
  },
  JOIN_SUCCESS: {
    isSuccess: true,
    code: 'MEMBER200',
    message: '회원가입 성공입니다.',
  },
  LOGIN_SUCCESS: {
    isSuccess: true,
    code: 'MEMBER2001',
    message: '로그인 성공',
  },
  // 게시글 성공
  GET_ALL_POSTS_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'POST200',
    message: '게시글 전체 조회 성공했습니다!',
  },
  GET_ONE_POST_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'POST200',
    message: '게시글 1개 조회 성공했습니다!',
  },
  MAKE_POST_SUCCESS: {
    status: StatusCodes.CREATED,
    isSuccess: true,
    code: 'POST201',
    message: '게시글 생성 성공했습니다!',
  },
  UPDATE_POST_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'POST200',
    message: '게시글 수정 성공했습니다!',
  },
  DELETE_POST_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'POST200',
    message: '게시글 삭제 성공했습니다!',
  },
  // 댓글 성공
  GET_COMMENTS_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'COMMENT200',
    message: '댓글 조회 성공했습니다!',
  },
  MAKE_COMMENT_SUCCESS: {
    status: StatusCodes.CREATED,
    isSuccess: true,
    code: 'COMMENT201',
    message: '댓글 생성 성공했습니다!',
  },
  UPDATE_COMMENT_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'COMMENT200',
    message: '댓글 수정 성공했습니다!',
  },
  DELETE_COMMENT_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'COMMENT200',
    message: '댓글 삭제 성공했습니다!',
  },
};
