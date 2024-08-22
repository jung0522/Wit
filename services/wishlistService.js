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
                // 먼저 해당 폴더에 제품이 이미 있는지 확인
                const [existingProduct] = await pool.query(
                    'SELECT 1 FROM cart_folder_product WHERE folder_id = ? AND product_id = ?',
                    [folderId, productId]
                );

                // 제품이 폴더에 없으면 추가
                if (existingProduct.length === 0) {
                    await pool.query(
                        'INSERT INTO cart_folder_product (folder_id, product_id) VALUES (?, ?)', 
                        [folderId, productId]
                    );
                }
            }
        }


        return {
            message: '폴더에 제품이 성공적으로 추가되었습니다',
            data: {
                folderIds,
            }
        };
    } catch (error) {
        console.error('폴더에 제품 추가 중 오류 발생', error);
        throw error;
    }
};



export const getProductsInCart = async (userId, cursor = 1, limit = 10) => {
    try {
        // 정수로 변환
        const intCursor = parseInt(cursor, 10) || 1; 
        const intLimit = parseInt(limit, 10) || 10;  

        // 1단계: 사용자의 장바구니 조회
        const [cart] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);

        if (cart.length === 0) {
            return { count: 0, products: [], nextCursor: null };
        }

        const cartId = cart[0].id;

        // 2단계: 장바구니의 제품과 해당 제품의 평균 평점, 리뷰 개수, heart 상태 조회
        const query = `
            WITH RankedProducts AS (
                SELECT
                    p.id AS product_id,
                    p.name,
                    p.en_price,
                    p.won_price,
                    p.image,
                    COALESCE(AVG(r.rating), 0) AS average_rating,
                    COALESCE(COUNT(r.id), 0) AS review_count,
                    EXISTS (
                        SELECT 1 
                        FROM user_heart uh 
                        WHERE uh.user_id = ? AND uh.product_id = p.id
                    ) AS heart,
                    ROW_NUMBER() OVER (ORDER BY p.id) AS row_num
                FROM product p
                JOIN cart_folder_product cfp ON p.id = cfp.product_id
                JOIN folder f ON cfp.folder_id = f.id
                LEFT JOIN review r ON p.id = r.product_id
                WHERE f.cart_id = ?
                GROUP BY p.id
            )
            SELECT
                product_id,
                name,
                en_price,
                won_price,
                image,
                average_rating,
                review_count,
                heart,
                (SELECT COUNT(*) FROM RankedProducts) AS total_count
            FROM RankedProducts
            WHERE row_num >= ? AND row_num < ? + ?
            ORDER BY row_num`;

        const params = [userId, cartId, intCursor, intCursor, intLimit];

        const [products] = await pool.query(query, params);

        // 0.5 단위로 반올림하는 함수
        const roundToNearestHalf = (num) => {
            return Math.round(num * 2) / 2;
        };

        // 평균 평점을 0.5 단위로 반올림하고, total_count를 제거한 결과 반환
        const roundedProducts = products.map(product => {
            const { total_count, ...rest } = product; // total_count 제거
            return {
                ...rest,
                average_rating: roundToNearestHalf(product.average_rating),
                heart: product.heart === 1 // heart 상태를 Boolean으로 변환
            };
        });

        // 전체 제품 수 
        const total_count = products.length > 0 ? products[0].total_count : 0;

        // nextCursor 계산: cursor + limit, total_count보다 작은지 확인
        const nextCursor = (roundedProducts.length === intLimit && intCursor + intLimit <= total_count) ? intCursor + intLimit : null;

        return {
            count:  total_count,
            products: roundedProducts,
            nextCursor
        };
    } catch (error) {
        console.error('장바구니에서 제품을 조회하는 중 오류 발생', error);
        throw error;
    }
};







// 유저가 생성한 폴더 조회 서비스
export const getUserFoldersFromDb = async (userId, cursor = 1, limit = 10) => {
    try {
        const intCursor = parseInt(cursor, 10) || 1; 
        const intLimit = parseInt(limit, 10) || 10; 
        
        // 1단계: 사용자가 생성한 총 폴더 수 조회
        const totalCountQuery = `
            SELECT COUNT(*) AS total_count
            FROM folder
            WHERE user_id = ?`;
        const [[{ total_count }]] = await pool.query(totalCountQuery, [userId]);

        // 2단계: 폴더를 커서 기반 페이지네이션으로 조회
        const query = `
            WITH RankedFolders AS (
                SELECT
                    f.id AS folder_id,
                    f.name AS folder_name,
                    ROW_NUMBER() OVER (ORDER BY f.id) AS row_num
                FROM folder f
                WHERE f.user_id = ?
            )
            SELECT
                folder_id,
                folder_name
            FROM RankedFolders
            WHERE row_num >= ? AND row_num < ? + ?
            ORDER BY row_num`;

        const [folders] = await pool.query(query, [userId, intCursor, intCursor, intLimit]);

        if (folders.length === 0) {
            // 폴더가 없는 경우
            return { count: total_count, folders: [], nextCursor: null };
        }

        // 3단계: 각 폴더에 대한 제품 이미지와 제품 수 조회
        const foldersWithProducts = await Promise.all(folders.map(async folder => {
            const [productRows] = await pool.query(
                `SELECT p.image
                 FROM product p
                 JOIN cart_folder_product cfp ON p.id = cfp.product_id
                 WHERE cfp.folder_id = ?
                 ORDER BY p.id DESC
                 LIMIT 3`, // 최신 3개의 이미지 선택
                [folder.folder_id]
            );

            const images = productRows.map(row => row.image);

            // 제품 수 카운트
            const [countRows] = await pool.query(
                `SELECT COUNT(*) AS product_count
                 FROM cart_folder_product
                 WHERE folder_id = ?`,
                [folder.folder_id]
            );
            const productCount = countRows[0].product_count;

            return {
                ...folder,
                images,
                productCount
            };
        }));

        // 4단계: 다음 커서 계산
        const nextCursor = (folders.length === intLimit && intCursor + intLimit <= total_count) 
            ? intCursor + intLimit 
            : null;

        return {
            count: total_count, // 전체 폴더 수를 반환
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

export const getProductsInFolderFromDb = async (folderId, userId, cursor = 1, limit = 10) => {
    try {
        // 정수 계산
        const intCursor = parseInt(cursor, 10) || 1;
        const intLimit = parseInt(limit, 10) || 10;

        // 1단계: 제품과 해당 제품의 평균 평점 및 리뷰 개수 조회, 하트 상태도 포함
        const query = `
            WITH RankedProducts AS (
                SELECT
                    p.id AS product_id,
                    p.name,
                    p.en_price,
                    p.won_price,
                    p.image,
                    COALESCE(AVG(r.rating), 0) AS average_rating,
                    COALESCE(COUNT(r.id), 0) AS review_count,
                    EXISTS (
                        SELECT 1 
                        FROM user_heart uh 
                        WHERE uh.user_id = ?
                        AND uh.product_id = p.id
                    ) AS heart,
                    ROW_NUMBER() OVER (ORDER BY p.id) AS row_num
                FROM product p
                JOIN cart_folder_product cfp ON p.id = cfp.product_id
                LEFT JOIN review r ON p.id = r.product_id
                WHERE cfp.folder_id = ?
                GROUP BY p.id
            )
            SELECT
                product_id,
                name,
                en_price,
                won_price,
                image,
                average_rating,
                review_count,
                heart,
                (SELECT COUNT(*) FROM RankedProducts) AS total_count
            FROM RankedProducts
            WHERE row_num >= ? AND row_num < ? + ?
            ORDER BY row_num`;

        const params = [userId, folderId, intCursor, intCursor, intLimit];

        const [products] = await pool.query(query, params);

        // 0.5 단위로 반올림하는 함수
        const roundToNearestHalf = (num) => {
            return Math.round(num * 2) / 2;
        };

        // 평균 평점을 0.5 단위로 반올림하고, total_count를 제거
        const roundedProducts = products.map(product => {
            const { total_count, ...rest } = product; // total_count 제거
            return {
                ...rest,
                average_rating: roundToNearestHalf(product.average_rating),
                heart: product.heart === 1 // 하트 상태를 boolean으로 변환
            };
        });

        // 전체 제품 수 
        const total_count = products.length > 0 ? products[0].total_count : 0;

        // nextCursor 계산: cursor + limit
        const nextCursor = (roundedProducts.length === intLimit && intCursor + intLimit <= total_count) ? intCursor + intLimit : null;

        return {
            count: total_count,
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