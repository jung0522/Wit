// cartService.js
import { pool } from '../config/db-config.js';

// 장바구니에 제품을 추가하는 함수
export const addProductToCart = async (userId, productId) => {
    try {
        // 1. 사용자의 장바구니를 가져오거나 없으면 새 장바구니 생성
        let [cart] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);

        if (cart.length === 0) {
            // 장바구니가 없으면 새 장바구니를 생성
            await pool.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);
            [cart] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
        }

        const cartId = cart[0].id;

        // 2. 장바구니에 폴더가 있는지 확인하거나 없으면 새 폴더 생성
        let [folder] = await pool.query('SELECT * FROM folder WHERE cart_id = ?', [cartId]);

        if (folder.length === 0) {
            // 새 폴더를 생성하고 카운트를 0으로 설정
            await pool.query('INSERT INTO folder (name, cart_id, count) VALUES (?, ?, ?)', ['Default Folder', cartId, 0]);
            [folder] = await pool.query('SELECT * FROM folder WHERE cart_id = ?', [cartId]);
        }

        const folderId = folder[0].id;

        // 3. 폴더에 제품이 이미 있는지 확인
        let [cartProduct] = await pool.query('SELECT * FROM cart_folder_product WHERE folder_id = ? AND product_id = ?', [folderId, productId]);

        if (cartProduct.length === 0) {
            // 제품을 cart_folder_product 테이블에 추가하고 폴더 카운트를 증가시킴
            await pool.query('INSERT INTO cart_folder_product (folder_id, product_id) VALUES (?, ?)', [folderId, productId]);
            await pool.query('UPDATE folder SET count = count + 1 WHERE id = ?', [folderId]);
        } else {
            // 제품이 이미 존재하면 카운트는 변경되지 않음
            console.log('제품이 이미 폴더에 존재합니다. 카운트는 변경되지 않습니다.');
        }

        // 4. 제품을 user_heart 테이블에 추가
        let [existingHeart] = await pool.query('SELECT * FROM user_heart WHERE user_id = ? AND product_id = ?', [userId, productId]);

        if (existingHeart.length === 0) {
            // 제품을 user_heart 테이블에 삽입
            await pool.query('INSERT INTO user_heart (user_id, product_id) VALUES (?, ?)', [userId, productId]);
            console.log('제품이 user_heart에 추가되었습니다.');
        } else {
            console.log('제품이 이미 user_heart에 있습니다.');
        }

        // 5. 제품 정보와 폴더의 카운트를 가져오기
        const [product] = await pool.query(`
            SELECT p.name, p.en_price, p.won_price, p.image, f.count 
            FROM product p
            JOIN cart_folder_product cfp ON p.id = cfp.product_id
            JOIN folder f ON cfp.folder_id = f.id
            WHERE p.id = ? AND f.cart_id = ?
        `, [productId, cartId]);

        console.log('제품 데이터:', product);  // 쿼리 결과를 로그에 출력

        if (product.length === 0) {
            console.error('데이터베이스 또는 장바구니에서 제품을 찾을 수 없습니다.');
            return {
                message: '데이터베이스 또는 장바구니에서 제품을 찾을 수 없습니다.',
                data: null
            };
        }

        return product[0]; // 제품 정보와 수량 반환
    } catch (error) {
        console.error('쿼리 실행 중 오류 발생', error);
        throw error;
    }
};

// 장바구니에서 제품을 제거하는 함수
export const removeProductFromCart = async (userId, productIds) => {
    try {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            throw new Error('productIds는 비어있지 않은 배열이어야 합니다.');
        }

        // 1. 해당 사용자의 장바구니를 가져오기
        let [cart] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);

        if (cart.length === 0) {
            return {
                message: '사용자의 장바구니를 찾을 수 없습니다.',
                data: null
            };
        }

        const cartId = cart[0].id;

        // 2. 장바구니에 폴더가 있는지 확인
        let [folder] = await pool.query('SELECT * FROM folder WHERE cart_id = ?', [cartId]);

        if (folder.length === 0) {
            return {
                message: '장바구니에 폴더를 찾을 수 없습니다.',
                data: null
            };
        }

        const folderId = folder[0].id;

        // 3. 해당 폴더에 제품이 있는지 확인
        const placeholders = productIds.map(() => '?').join(',');
        const queryCheck = 
            `SELECT product_id
            FROM cart_folder_product
            WHERE folder_id = ? AND product_id IN (${placeholders})`;
        
        const [existingProducts] = await pool.query(queryCheck, [folderId, ...productIds]);
        const existingProductIds = existingProducts.map(product => product.product_id);

        // 존재하지 않는 제품 확인
        const missingProductIds = productIds.filter(id => !existingProductIds.includes(id));

        // 존재하지 않는 제품이 있을 경우 메시지 반환
        if (missingProductIds.length > 0) {
            return {
                message: '없는 제품이 있습니다.',
                missing_product_ids: missingProductIds
            };
        }

        // 존재하는 제품 삭제
        const queryDelete = 
            `DELETE FROM cart_folder_product
            WHERE folder_id = ? AND product_id IN (${placeholders})`;
        
        await pool.query(queryDelete, [folderId, ...productIds]);

        const queryDelete2 = 
            `DELETE FROM user_heart
            WHERE user_id = ? AND product_id IN (${placeholders})`;
        
        await pool.query(queryDelete2, [userId, ...productIds]);
        
        return {
            message: '제품이 성공적으로 삭제되었습니다.',
            deleted_product_ids: existingProductIds
        };
    } catch (error) {
        console.error('쿼리 실행 중 오류 발생', error);
        throw error;
    }
};
