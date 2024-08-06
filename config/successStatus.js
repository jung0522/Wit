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
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'TOKEN200',
    message: 'JWT 토큰 검증 성공',
  },
  SIGNUP_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'MEMBER200',
    message: '회원가입 성공입니다.',
  },
  // 로그인
  KAKAO_LOGIN_PAGE_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'LOGIN200',
    message: '카카오 로그인 페이지 불러오기에 성공했습니다!',
  },

  NAVER_LOGIN_PAGE_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'LOGIN200',
    message: '네이버 로그인 페이지 불러오기에 성공했습니다!',
  },

  KAKAO_LOGIN_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'LOGIN200',
    message: '카카오 로그인 성공했습니다!',
  },
  NAVER_LOGIN_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'LOGIN200',
    message: '네이버 로그인 성공했습니다!',
  },
  NEW_USER_NAVER_LOGIN_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'LOGIN200',
    message: '새로운 회원의 네이버 로그인에 성공했습니다!',
  },
  LOGIN_NAVER_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'LOGIN200',
    message: '기존 회원의 네이버 로그인에 성공했습니다!',
  },
  LOGIN_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'LOGIN200',
    message: '로그인 성공했습니다!',
  },
  LOGOUT_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'LOGOUT200',
    message: '로그아웃에 성공했습니다!',
  },

  WITHDRAW_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'WITHDRAW200',
    message: '회원탈퇴에 성공했습니다!',
  },

  GET_ALL_USERS_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'USER200',
    message: '유저 전체 정보 조회에 성공했습니다!',
  },
  GET_ONE_USER_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'USER200',
    message: '유저 정보 조회에 성공했습니다!',
  },
  UPDATE_USER_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'USER200',
    message: '유저 정보 수정에 성공했습니다!',
  },
  UPLOAD_PROFILE_IMAGE_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'USER200',
    message: '유저 프로필 이미지 업로드에 성공했습니다!',
  },
  GET_PROFILE_IMAGE_SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 'USER200',
    message: '유저 프로필 이미지 조회에 성공했습니다!',
  },

  // 랜딩 페이지
  LANDING_SUCCESS: {
    isSuccess: true,
    code: 'LANDING200',
    message: '랜딩 페이지 정보 조회에 성공했습니다!',
  },

  // 게시글
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
