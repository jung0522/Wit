import { Router } from 'express';
import { getWishlist, createFolder, getUserFolders, updateFolderName, deleteFolders, getProductsInFolder, deleteProductsFromFolderController } from '../controller/wishlistController.js'

const router = Router();

router.get('/:user_id', getWishlist); // 장바구니의 제품 목록 조회
router.get('/user-folders/:user_id', getUserFolders); // GET 요청을 처리하는 라우트
router.post('/create-folder/:user_id', createFolder); // POST 요청을 처리하는 라우트
router.post('/update-folder/:user_id', updateFolderName); // 폴더 이름 변경을 위한 POST 요청
router.delete('/delete-folders/:user_id', deleteFolders); // 다중 폴더 삭제
router.get('/folder-products/:folder_id', getProductsInFolder);  // 폴더 내 상품 정보 조회
router.delete('/folder-products/:folder_id', deleteProductsFromFolderController); // 폴더 내 상품 삭제

export default router;