// controller/cartController.js
import { addProductToCart, removeProductFromCart } from '../services/cartService.js';

// 장바구니에 제품을 추가하는 API 핸들러
export const addToCart = async (req, res) => {
    try {
        const productId = req.params.productId; // URL 파라미터에서 제품 ID 가져오기
        const user_id = req.user_id; // 인증된 요청에서 사용자 ID 가져오기

        if (!user_id || !productId) {
            return res.status(400).json({ message: 'user_id, folder_id, and product_ids are required' });
        }

        // 제품을 장바구니에 추가
        const productData = await addProductToCart(user_id, productId);

        // 성공적인 응답 반환
        res.status(200).json({ 
            message: '제품이 장바구니에 성공적으로 추가되었습니다.',
            data: productData
        });
    } catch (error) {
        // 오류 발생 시 응답 반환
        res.status(500).json({ message: '장바구니에 제품을 추가하는 중 오류 발생', error: error.message });
    }
};

// 장바구니에서 제품을 제거하는 API 핸들러
export const removeToCart = async (req, res) => {
    try {
        const user_id = req.user_id; // 인증된 요청에서 사용자 ID 가져오기
        const { product_ids } = req.body;

        if (!user_id || !product_ids) {
            return res.status(400).json({ message: 'user_id, folder_id, and product_ids are required' });
        }

        // 장바구니에서 제품 제거
        const result = await removeProductFromCart(user_id, product_ids);

        if (result.message === 'Product not found in the folder.') {
            // 폴더에서 제품을 찾을 수 없는 경우
            return res.status(404).json({ 
                message: '폴더에서 제품을 찾을 수 없습니다.',
            });
        }

        // 성공적인 응답 반환
        res.status(200).json({ 
            message: '제품이 장바구니에서 성공적으로 제거되었습니다.',
        });
    } catch (error) {
        // 오류 발생 시 응답 반환
        res.status(500).json({ message: '장바구니에서 제품을 제거하는 중 오류 발생', error: error.message });
    }
};
