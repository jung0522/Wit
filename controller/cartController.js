import { addProductToCart } from '../services/cartService.js';
import { removeProductFromCart } from '../services/cartService.js';

export const addToCart = async (req, res) => {
    try {
        const { user_id } = req.body;  // user_id를 요청 본문에서 가져옴
        const productId = req.params.productId;

        if (!user_id) {
            return res.status(400).json({ message: 'user_id is required' });
        }

        // 제품 추가
        const productData = await addProductToCart(user_id, productId);

        // 제품 추가 결과 반환
        res.status(200).json({ 
            message: 'Product added to cart successfully',
            data: productData
        });
    } catch (error) {
        // 오류 처리
        res.status(500).json({ message: 'Error adding product to cart', error: error.message });
    }
};

export const removeToCart = async (req, res) => {
    try {
        const { user_id } = req.body;  // user_id를 요청 본문에서 가져옴
        const productId = req.params.productId;

        if (!user_id) {
            return res.status(400).json({ message: 'user_id is required' });
        }

        // 제품 제거
        const result = await removeProductFromCart(user_id, productId);

        // 제품 제거 결과 반환
        if (result.message === 'Product not found in the folder.') {
            return res.status(404).json({ 
                message: 'Product not found in the folder.',
            });
        }

        res.status(200).json({ 
            message: 'Product removed from cart successfully',
        });
    } catch (error) {
        // 오류 처리
        res.status(500).json({ message: 'Error removing product from cart', error: error.message });
    }
};