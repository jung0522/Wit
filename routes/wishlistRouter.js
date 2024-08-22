// routes/wishlistRouter.js
import { Router } from 'express';
import {
    getWishlist,
    createFolder,
    addProductsToFoldersController,
    getUserFolders,
    updateFolderName,
    deleteFolders,
    getProductsInFolder,
    deleteProductsFromFolderController
} from '../controller/wishlistController.js';
import { decodeAccessToken } from '../middleware/jwtMiddleware.js';

const router = Router();

// 전체 라우터에 적용
router.use(decodeAccessToken);

router.get('/', getWishlist); // 장바구니의 제품 목록 조회
router.get('/user-folders', getUserFolders); // 유저가 만든 폴더 조회
router.post('/create-folder', createFolder); // 폴더 생성
router.post('/add-product', addProductsToFoldersController);
router.post('/update-folder', updateFolderName); // 폴더 이름 변경
router.post('/delete-folders', deleteFolders); // 다중 폴더 삭제
router.get('/folder-products/:folder_id', getProductsInFolder); // 폴더 내 상품 정보 조회
router.post('/folder-products/:folder_id/delete', deleteProductsFromFolderController); // 폴더 내 상품 삭제

export default router;
