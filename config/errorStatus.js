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
  AUTHENTICATION_FAILED: {
    status: StatusCodes.UNAUTHORIZED,
    isSuccess: false,
    code: 'MEMBER401',
    message: '인증되지 않았습니다.',
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

  USER_PRIVATE_KEY_IS_WRONG: {
    status: StatusCodes.BAD_REQUEST,
    isSuccess: false,
    code: 'COMMON005',
    message: '유저 private key가 잘못됐습니다.',
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
  ONBOARDING_BAD_REQUEST: {
    status: StatusCodes.BAD_REQUEST,
    isSuccess: false,
    code: 'ONBOARDING400',
    message: '필수 필드가 누락되었거나 잘못된 형식입니다.',
  },
  ONBOARDING_LIMIT_EXCEEDED: {
    status: StatusCodes.BAD_REQUEST,
    isSuccess: false,
    code: 'ONBOARDING_LIMIT400',
    message:
      '여행 유형, 성향 유형은 최대 3개까지, 기념품은 최대 2개까지 선택할 수 있습니다.',
  },
  // 로그인 에러
  INVALID_CREDENTIALS_MAKE_ACCOUNT: {
    status: StatusCodes.UNAUTHORIZED,
    isSuccess: false,
    code: 'MEMBER002',
    message: '입력하신 정보에 해당하는 계정이 없습니다. 계정을 생성하겠습니다.',
  },

  INVALID_CREDENTIALS: {
    status: StatusCodes.UNAUTHORIZED,
    isSuccess: false,
    code: 'MEMBER002',
    message: '입력하신 정보에 해당하는 계정이 없습니다. 계정을 생성하겠습니다.',
  },

  //토큰 오류
  TOKEN_VERIFICATION_FAILURE: {
    status: StatusCodes.UNAUTHORIZED,
    isSuccess: false,
    code: 'TOKEN401',
    message: 'JWT 토큰 검증 실패',
  },

  REFRESH_TOKEN_MISIING: {
    isSuccess: false,
    code: 'TOKEN401',
    message: 'REFRESH 토큰이 없습니다.',
  },

  INVALID_REFRESH_TOKEN: {
    isSuccess: false,
    code: 'TOKEN401',
    message: 'REFRESH 토큰값이 유효하지 않습니다.',
  },
  REFRESH_TOKEN_EXPIRED: {
    isSuccess: false,
    code: 'TOKEN401',
    message: 'REFRESH 토큰값이 만료됐습니다. 다시 로그인 해주세요!',
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
  PROUDCT_SEARCH_FAILED: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: 'SEARCHES500',
    message: '기념품 검색에 실패했습니다.',
  },
  // 유저 최근 검색어 조회 실패
  RECENT_SEARCHES_FAILED: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: 'RECENT_SEARCHES500',
    message: '최근 검색어 조회에 실패했습니다.',
  },

  // 인기 검색어 조회 실패
  POPULAR_SEARCHES_FAILED: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: 'POPULAR_SEARCHES500',
    message: '인기 검색어 조회에 실패했습니다.',
  },
  USER_NOT_FOUND: {
    status: StatusCodes.NOT_FOUND,
    isSuccess: false,
    code: 'USER404',
    message: '사용자를 찾을 수 없습니다.',
  },
  NO_CONTENT: {
    status: StatusCodes.NO_CONTENT,
    isSuccess: false,
    code: 'WISHLIST204',
    message: '장바구니에 상품이 없습니다.',
  },

  // 온보딩 실패
  ONBOARDING_FAILED: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: 'ONBOARDING_FAILED500',
    message: '온보딩 저장에 실패했습니다.',
  },
};
