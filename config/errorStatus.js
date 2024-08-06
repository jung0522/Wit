import { StatusCodes } from 'http-status-codes';

export const errStatus = {
  // error
  INTERNAL_SERVER_ERROR: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: 'COMMON000',
    message: '서버 에러, 관리자에게 문의 바랍니다.',
  },
  BAD_REQUEST: {
    status: StatusCodes.BAD_REQUEST,
    isSuccess: false,
    code: 'COMMON001',
    message: '잘못된 요청입니다.',
  },
  UNAUTHORIZED: {
    status: StatusCodes.UNAUTHORIZED,
    isSuccess: false,
    code: 'COMMON002',
    message: '권한이 잘못되었습니다.',
  },
  METHOD_NOT_ALLOWED: {
    status: StatusCodes.METHOD_NOT_ALLOWED,
    isSuccess: false,
    code: 'COMMON003',
    message: '지원하지 않는 Http Method 입니다.',
  },
  FORBIDDEN: {
    status: StatusCodes.FORBIDDEN,
    isSuccess: false,
    code: 'COMMON004',
    message: '금지된 요청입니다.',
  },
  WRONG_EXTENSION: {
    status: StatusCodes.WRONG_EXTENSION,
    isSuccess: false,
    code: 'COMMON005',
    message: '잘못된 확장자입니다.',
  },
  // 회원가입 에러
  SIGNUP_AUTHENTICATION_FAILED: {
    status: StatusCodes.UNAUTHORIZED,
    isSuccess: false,
    code: 'MEMBER401',
    message: '인증되지 않았습니다. ID/PW를 확인해주세요.',
  },
  SIGNUP_ALREADY_REGISTERED: {
    status: StatusCodes.UNAUTHORIZED,
    isSuccess: false,
    code: 'MEMBER002',
    message: '이미 가입하였습니다.',
  },
  USER_ID_IS_WRONG: {
    status: StatusCodes.BAD_REQUEST,
    isSuccess: false,
    code: 'COMMON005',
    message: '유저 id가 잘못됐습니다.',
  },
  INVALID_USER_DATA: {
    status: StatusCodes.BAD_REQUEST,
    isSuccess: false,
    code: 'USER 400',
    message: '유저 데이터가 잘못됐습니다.',
  },

  UPLOAD_PROFILE_IMAGE_FAIL: {
    status: StatusCodes.BAD_REQUEST,
    isSuccess: false,
    code: 'USER 400',
    message: '유저 프로필 이미지 업로드에 실패했습니다.',
  },
  GET_PROFILE_IMAGE_FAIL: {
    status: StatusCodes.BAD_REQUEST,
    isSuccess: false,
    code: 'USER 400',
    message: '유저 프로필 이미지 조회에 실패했습니다.',
  },

  // 로그인 에러
  INVALID_CREDENTIALS: {
    status: StatusCodes.UNAUTHORIZED,
    isSuccess: false,
    code: 'MEMBER002',
    message: '입력하신 정보에 해당하는 계정이 없습니다. 계정을 생성하겠습니다.',
  },
  //토큰 오류
  TOKEN_VERIFICATION_FAILURE: {
    isSuccess: false,
    code: 'TOKEN401',
    message: 'JWT 토큰 검증 실패',
  },
  // 게시글 오류
  POST_NOT_FOUND: {
    status: StatusCodes.NOT_FOUND,
    isSuccess: false,
    code: 'POST404',
    message:
      '요청하신 게시글을 찾을 수 없습니다. 게시글이 삭제되었거나 존재하지 않을 수 있습니다.',
  },
  POST_CREATION_FAILED: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: 'POST500',
    message: '게시글 작성 중 오류가 발생했습니다.',
  },
  POST_UPDATE_FAILED: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: 'POST500',
    message: '게시글 수정 중 오류가 발생했습니다.',
  },
  POST_DELETE_FAILED: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: 'POST500',
    message: '게시글 삭제 중 오류가 발생했습니다.',
  },
  // 댓글 오류
  COMMENT_NOT_FOUND: {
    status: StatusCodes.NOT_FOUND,
    isSuccess: false,
    code: 'COMMENT404',
    message:
      '요청하신 댓글을 찾을 수 없습니다. 댓글이 삭제되었거나 존재하지 않을 수 있습니다.',
  },
  COMMENT_CREATION_FAILED: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: 'COMMENT500',
    message: '댓글 작성 중 오류가 발생했습니다.',
  },
  COMMENT_UPDATE_FAILED: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: 'COMMENT500',
    message: '댓글 수정 중 오류가 발생했습니다.',
  },
  COMMENT_DELETE_FAILED: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: 'COMMENT500',
    message: '댓글 삭제 중 오류가 발생했습니다.',
  },
};
