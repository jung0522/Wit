import { pool } from '../config/db-config.js';

export const createFolderWithProducts = async (userId, product_ids, folder_name) => {
    try {
        // 1. 폴더 생성
        const [folderResult] = await pool.query(
            'INSERT INTO folder (name, user_id) VALUES (?, ?)', 
            [folder_name, userId]
        );

        const folderId = folderResult.insertId;

        // 2. 폴더에 제품 추가
        for (const productId of product_ids) {
            await pool.query(
                'INSERT INTO cart_folder_product (folder_id, product_id) VALUES (?, ?)', 
                [folderId, productId]
            );
        }

        // 3. 추가된 제품 정보와 리뷰, 하트 상태 조회
        const [products] = await pool.query(
            `SELECT 
                p.id AS product_id, 
                p.name, 
                p.en_price, 
                p.won_price, 
                p.image,
                COALESCE(AVG(r.rating), 0) AS average_rating,
                COALESCE(COUNT(r.id), 0) AS review_count,
                EXISTS(SELECT 1 FROM user_heart uh WHERE uh.user_id = ? AND uh.product_id = p.id) AS heart
             FROM product p
             JOIN cart_folder_product cfp ON p.id = cfp.product_id
             LEFT JOIN review r ON p.id = r.product_id
             WHERE cfp.folder_id = ?
             GROUP BY p.id`,
            [userId, folderId]
        );

        // 0.5 단위로 반올림하는 함수
        const roundToNearestHalf = (num) => {
            return Math.round(num * 2) / 2;
        };

        // 평균 평점을 0.5 단위로 반올림
        const roundedProducts = products.map(product => ({
            ...product,
            average_rating: roundToNearestHalf(product.average_rating),
            heart: product.heart === 1 // heart가 1이면 true, 아니면 false로 변환
        }));

        return {
            message: 'Folder created successfully',
            data: {
                folderId,
                folder_name,
                products: roundedProducts
            }
        };
    } catch (error) {
        console.error('Error creating folder', error);
        throw error;
    }
};

export const addProductsToFolders = async (folderIds, productIds, userId) => {
    try {
        // 각 폴더에 제품 추가
        for (const folderId of folderIds) {
            for (const productId of productIds) {
                await pool.query(
                    'INSERT INTO cart_folder_product (folder_id, product_id) VALUES (?, ?)', 
                    [folderId, productId]
                );
            }
        }

        // 모든 폴더에 대한 업데이트된 제품 정보 조회
        const [products] = await pool.query(
            `SELECT 
                p.id AS product_id, 
                p.name, 
                p.en_price, 
                p.won_price, 
                p.image,
                COALESCE(AVG(r.rating), 0) AS average_rating,
                COALESCE(COUNT(r.id), 0) AS review_count,
                EXISTS(SELECT 1 FROM user_heart uh WHERE uh.user_id = ? AND uh.product_id = p.id) AS heart
             FROM product p
             JOIN cart_folder_product cfp ON p.id = cfp.product_id
             LEFT JOIN review r ON p.id = r.product_id
             WHERE cfp.folder_id IN (?)
             GROUP BY p.id`,
            [userId, folderIds]
        );

        // 0.5 단위로 반올림하는 함수
        const roundToNearestHalf = (num) => {
            return Math.round(num * 2) / 2;
        };

        // 평균 평점을 0.5 단위로 반올림
        const roundedProducts = products.map(product => ({
            ...product,
            average_rating: roundToNearestHalf(product.average_rating),
            heart: product.heart === 1 // heart가 1이면 true, 아니면 false로 변환
        }));

        return {
            message: '폴더에 제품이 성공적으로 추가되었습니다',
            data: {
                folderIds,
                products: roundedProducts
            }
        };
    } catch (error) {
        console.error('폴더에 제품 추가 중 오류 발생', error);
        throw error;
    }
};


export const getProductsInCart = async (userId, cursor = 0, limit = 10) => {
    try {
        // 1단계: 사용자의 장바구니 조회
        const [cart] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);

        if (cart.length === 0) {
            return { count: 0, products: [], nextCursor: null };
        }

        const cartId = cart[0].id;

        // 2단계: 장바구니의 제품과 해당 제품의 평균 평점, 리뷰 개수, heart 상태 조회
        const [products] = await pool.query(
            `SELECT p.id AS product_id, p.name, p.en_price, p.won_price, p.image,
                    COALESCE(AVG(r.rating), 0) AS average_rating,
                    COALESCE(COUNT(r.id), 0) AS review_count,
                    EXISTS (
                        SELECT 1 
                        FROM user_heart uh 
                        WHERE uh.user_id = ? AND uh.product_id = p.id
                    ) AS heart
             FROM product p
             JOIN cart_folder_product cfp ON p.id = cfp.product_id
             JOIN folder f ON cfp.folder_id = f.id
             LEFT JOIN review r ON p.id = r.product_id
             WHERE f.cart_id = ?
             AND p.id > ?  -- cursor 값 이후의 상품만 가져옴
             GROUP BY p.id
             ORDER BY p.id
             LIMIT ?`,  // limit 만큼만 결과를 가져옴
            [userId, cartId, cursor, limit]
        );

        // 0.5 단위로 반올림하는 함수
        const roundToNearestHalf = (num) => {
            return Math.round(num * 2) / 2;
        };

        // 평균 평점을 0.5 단위로 반올림하고 결과 반환
        const roundedProducts = products.map(product => ({
            ...product,
            average_rating: roundToNearestHalf(product.average_rating),
            heart: product.heart === 1 // heart 상태를 Boolean으로 변환
        }));

        // nextCursor 계산: 결과 중 마지막 제품의 ID를 다음 cursor로 사용
        const nextCursor = roundedProducts.length === limit ? roundedProducts[roundedProducts.length - 1].product_id : null;

        return {
            count: roundedProducts.length,
            products: roundedProducts,
            nextCursor
        };
    } catch (error) {
        console.error('장바구니에서 제품을 조회하는 중 오류 발생', error);
        throw error;
    }
};






// 유저가 생성한 폴더 조회 서비스
export const getUserFoldersFromDb = async (userId, cursor = 0, limit = 10) => {
    try {
        // 1단계: 사용자가 생성한 폴더를 커서 기반 페이지네이션으로 조회
        const [folders] = await pool.query(
            `SELECT * FROM folder 
             WHERE user_id = ? 
             AND id > ?  -- 커서 기반 페이지네이션
             ORDER BY id ASC
             LIMIT ?`, 
            [userId, cursor, limit]
        );

        if (folders.length === 0) {
            return { count: 0, folders: [], nextCursor: null };
        }

        // 2단계: 각 폴더에 대한 제품 이미지와 제품 수 조회
        const foldersWithProducts = await Promise.all(folders.map(async folder => {
            const [productRows] = await pool.query(
                `SELECT p.image
                 FROM product p
                 JOIN cart_folder_product cfp ON p.id = cfp.product_id
                 WHERE cfp.folder_id = ?
                 ORDER BY p.id DESC
                 LIMIT 3`, // 최신 3개의 이미지 선택
                [folder.id]
            );

            const images = productRows.map(row => row.image);

            const [[{ productCount }]] = await pool.query(
                `SELECT COUNT(*) AS productCount
                 FROM cart_folder_product cfp
                 WHERE cfp.folder_id = ?`,
                [folder.id]
            );

            return {
                folder_id: folder.id,
                folder_name: folder.name,
                images,
                product_count: productCount
            };
        }));

        // 3단계: 다음 커서 계산
        const nextCursor = foldersWithProducts.length === limit 
            ? foldersWithProducts[foldersWithProducts.length - 1].folder_id 
            : null;

        return {
            count: foldersWithProducts.length,
            folders: foldersWithProducts,
            nextCursor // null이면 더 이상 가져올 폴더가 없음을 의미
        };
    } catch (error) {
        console.error('사용자가 생성한 폴더를 조회하는 중 오류 발생', error);
        throw error;
    }
};


// 폴더 이름 변경 서비스
export const updateFolderNameInDb = async (userId, folderId, newFolderName) => {
    try {
        const [result] = await pool.query(
            `UPDATE folder
             SET name = ?
             WHERE id = ? AND user_id = ?`,
            [newFolderName, folderId, userId]
        );

        return result;
    } catch (error) {
        console.error('Error updating folder name', error);
        throw error;
    }
};

// 폴더 삭제 서비스
export const deleteFoldersFromDb = async (userId, folderIds) => {
    try {
        // 폴더 삭제
        const [result] = await pool.query(
            `DELETE FROM folder
             WHERE id IN (?) AND user_id = ?`,
            [folderIds, userId]
        );

        // 삭제된 폴더 ID를 포함한 결과 반환
        return {
            deleted_folder_ids: folderIds // 삭제한 폴더 ID 목록
        };
    } catch (error) {
        console.error('Error deleting folders', error);
        throw error;
    }
};

export const getProductsInFolderFromDb = async (folderId, userId, cursor = 0, limit = 10) => {
    try {
        // 제품과 해당 제품의 평균 평점 및 리뷰 개수 조회, 하트 상태도 포함
        const [products] = await pool.query(
            `SELECT p.id AS product_id, 
                    p.name, 
                    p.en_price, 
                    p.won_price, 
                    p.image,
                    COALESCE(AVG(r.rating), 0) AS average_rating,
                    COALESCE(COUNT(r.id), 0) AS review_count,
                    EXISTS(
                        SELECT 1 
                        FROM user_heart uh 
                        WHERE uh.user_id = ? 
                        AND uh.product_id = p.id
                    ) AS heart
             FROM product p
             JOIN cart_folder_product cfp ON p.id = cfp.product_id
             LEFT JOIN review r ON p.id = r.product_id
             WHERE cfp.folder_id = ?
             AND p.id > ?  -- Cursor-based pagination: 이전 페이지의 마지막 ID보다 큰 ID만 가져옴
             GROUP BY p.id
             ORDER BY p.id ASC
             LIMIT ?`,  // Limit: 한 번에 가져올 제품의 수
            [userId, folderId, cursor, limit]
        );

        // 0.5 단위로 반올림하는 함수
        const roundToNearestHalf = (num) => {
            return Math.round(num * 2) / 2;
        };

        // 평균 평점을 0.5 단위로 반올림
        const roundedProducts = products.map(product => ({
            ...product,
            average_rating: roundToNearestHalf(product.average_rating),
            heart: product.heart === 1 // 하트 상태를 boolean으로 변환
        }));

        // nextCursor 계산: 다음 페이지의 시작점으로 마지막 product_id를 사용
        const nextCursor = roundedProducts.length === limit 
            ? roundedProducts[roundedProducts.length - 1].product_id 
            : null;

        return {
            count: roundedProducts.length,
            products: roundedProducts,
            nextCursor // null이면 더 이상 데이터가 없음을 의미
        };
    } catch (error) {
        console.error('Error retrieving products in folder', error);
        throw error;
    }
};



// 폴더 내 상품 삭제 서비스
export const deleteProductsFromFolder = async (folderId, productIds) => {
    try {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            throw new Error('productIds must be a non-empty array');
        }

        const placeholders = productIds.map(() => '?').join(',');
        const query = 
            `DELETE FROM cart_folder_product
             WHERE folder_id = ? AND product_id IN (${placeholders})`;
        
        await pool.query(query, [folderId, ...productIds]);
        
        return {
            message: 'Products deleted successfully',
        };
    } catch (error) {
        console.error('Error deleting products from folder', error);
        throw error;
    }
};