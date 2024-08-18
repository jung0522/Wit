// routes/mypageRouter.js

import express from 'express';
import { getProfile, updateProfile, deleteUserProfile } from '../controller/mypageController.js';

const router = express.Router();

// 사용자 프로필 조회
router.get('/profile/:userId', getProfile);

// 사용자 프로필 수정
router.put('/profile/:userId', updateProfile);

// 사용자 회원 탈퇴
router.delete('/profile/:userId', deleteUserProfile);

export default router;