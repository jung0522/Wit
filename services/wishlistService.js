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

        // 3. 추가된 제품 정보와 리뷰, 장바구니에 있는지 여부(heart 상태) 조회
        const [products] = await pool.query(
            `SELECT 
                p.id AS product_id, 
                p.name, 
                p.en_price, 
                p.won_price, 
                p.image,
                COALESCE(AVG(r.rating), 0) AS average_rating,
                COALESCE(COUNT(r.id), 0) AS review_count,
                EXISTS(
                    SELECT 1 
                    FROM cart_folder_product cfp
                    JOIN folder f ON cfp.folder_id = f.id
                    WHERE f.cart_id = (
                        SELECT id FROM cart WHERE user_id = ?
                    )
                    AND cfp.product_id = p.id
                ) AS heart
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

        // 평균 평점을 0.5 단위로 반올림하고 heart 값을 boolean으로 변환
        const roundedProducts = products.map(product => ({
            ...product,
            average_rating: roundToNearestHalf(product.average_rating),
            heart: product.heart === 1 // heart가 1이면 true, 아니면 false로 변환
        }));

        return {
            message: '폴더가 성공적으로 생성되었습니다',
            data: {
                folderId,
                folder_name,
                products: roundedProducts
            }
        };
    } catch (error) {
        console.error('폴더 생성 중 오류 발생', error);
        throw error;
    }
};

// 폴더에 제품 추가 함수
export const addProductsToFolders = async (folderIds, productIds, userId) => {
    try {
        for (const folderId of folderIds) {
            for (const productId of productIds) {
                // 해당 폴더에 제품이 이미 있는지 확인
                const [existingProduct] = await pool.query(
                    'SELECT 1 FROM cart_folder_product WHERE folder_id = ? AND product_id = ?',
                    [folderId, productId]
                );

                // 제품이 이미 폴더에 존재하면 메시지 반환
                if (existingProduct.length > 0) {
                    return {
                        message: '이미 있는 제품입니다',
                        data: {
                            folderId,
                            productId
                        }
                    };
                }

                // 제품이 폴더에 없으면 추가
                await pool.query(
                    'INSERT INTO cart_folder_product (folder_id, product_id) VALUES (?, ?)', 
                    [folderId, productId]
                );
            }
        }

        return {
            message: '폴더에 제품이 성공적으로 추가되었습니다',
            data: {
                folderIds,
                productIds
            }
        };
    } catch (error) {
        console.error('폴더에 제품 추가 중 오류 발생', error);
        throw error;
    }
};

// 장바구니에 있는 제품 조회 함수
export const getProductsInCart = async (userId, cursor = 1, limit = 10) => {
    try {
        // 커서와 제한을 정수로 변환
        const intCursor = parseInt(cursor, 10) || 1; 
        const intLimit = parseInt(limit, 10) || 10;  

        // 1단계: 사용자의 장바구니를 조회
        const [cart] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);

        if (cart.length === 0) {
            return { count: 0, products: [], nextCursor: null };
        }

        const cartId = cart[0].id;

        // 2단계: 제품 정보 조회, 평균 평점, 리뷰 개수, 하트 상태 포함
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
                    ROW_NUMBER() OVER (ORDER BY p.created_at DESC, p.id DESC) AS row_num
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

        // 제품을 처리하여 반환
        const roundedProducts = products.map(product => {
            const { total_count, ...rest } = product; // total_count를 제거
            return {
                ...rest,
                average_rating: roundToNearestHalf(product.average_rating),
                heart: product.heart === 1 // heart가 1이면 true, 아니면 false로 변환
            };
        });

        // 전체 수량과 다음 커서 계산
        const total_count = products.length > 0 ? products[0].total_count : 0;
        const nextCursor = (roundedProducts.length === intLimit && intCursor + intLimit <= total_count) ? intCursor + intLimit : null;

        return {
            count: total_count,
            products: roundedProducts,
            nextCursor
        };
    } catch (error) {
        console.error('장바구니의 제품 조회 중 오류 발생', error);
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
                    ROW_NUMBER() OVER (ORDER BY f.created_at DESC, f.id DESC) AS row_num
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
                folder_id: folder.folder_id,
                folder_name: folder.folder_name,
                images,
                product_count: productCount
            };
        }));

        // 다음 커서 계산
        const nextCursor = (foldersWithProducts.length === intLimit && intCursor + intLimit <= total_count) ? intCursor + intLimit : null;

        return {
            count: total_count,
            folders: foldersWithProducts,
            nextCursor
        };
    } catch (error) {
        console.error('폴더 조회 중 오류 발생', error);
        throw error;
    }
};




// 폴더 이름을 업데이트하는 함수
export const updateFolderNameInDb = async (userId, folderId, newFolderName) => {
    try {
        // 폴더가 존재하는지 확인
        const [checkResult] = await pool.query(
            `SELECT COUNT(*) as count
             FROM folder
             WHERE id = ? AND user_id = ?`,
            [folderId, userId]
        );

        // 폴더가 없으면 메시지 반환
        if (checkResult[0].count === 0) {
            return { message: '없는 폴더입니다.' };
        }

        // 폴더 이름 업데이트
        const [result] = await pool.query(
            `UPDATE folder
             SET name = ?
             WHERE id = ? AND user_id = ?`,
            [newFolderName, folderId, userId]
        );

        return result;
    } catch (error) {
        console.error('폴더 이름 업데이트 중 오류 발생', error);
        throw error;
    }
};

// 폴더 삭제 함수
export const deleteFoldersFromDb = async (userId, folderIds) => {
    try {
        // 삭제하려는 폴더가 존재하는지 확인
        const [existingFolders] = await pool.query(
            `SELECT id
             FROM folder
             WHERE id IN (?) AND user_id = ?`,
            [folderIds, userId]
        );

        // 존재하는 폴더 ID 목록 가져오기
        const existingFolderIds = existingFolders.map(folder => folder.id);

        // 존재하지 않는 폴더 ID 확인
        const missingFolderIds = folderIds.filter(id => !existingFolderIds.includes(id));

        // 존재하지 않는 폴더가 있을 경우 메시지 반환
        if (missingFolderIds.length > 0) {
            return {
                message: '없는 폴더가 있습니다.',
            };
        }

        // 폴더 삭제
        const [result] = await pool.query(
            `DELETE FROM folder
             WHERE id IN (?) AND user_id = ?`,
            [folderIds, userId]
        );

        // 삭제된 폴더 ID를 포함한 결과 반환
        return {
            deleted_folder_ids: existingFolderIds
        };
    } catch (error) {
        console.error('폴더 삭제 중 오류 발생', error);
        throw error;
    }
};

// 폴더에 있는 제품을 조회하는 함수
export const getProductsInFolderFromDb = async (folderId, userId, cursor = 1, limit = 10) => {
    try {
        // 커서와 제한을 정수로 변환
        const intCursor = parseInt(cursor, 10) || 1;
        const intLimit = parseInt(limit, 10) || 10;

        // 1단계: 제품과 해당 제품의 평균 평점, 리뷰 개수, 하트 상태 조회
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
                    ROW_NUMBER() OVER (ORDER BY p.created_at DESC, p.id DESC) AS row_num
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
        console.error('폴더 내 제품 조회 중 오류 발생', error);
        throw error;
    }
};



// 폴더에서 제품 삭제 함수
export const deleteProductsFromFolder = async (folderId, productIds) => {
    try {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            throw new Error('productIds는 비어있지 않은 배열이어야 합니다.');
        }

        // 폴더 내에서 제품이 존재하는지 확인
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
        
        return {
            message: '제품이 성공적으로 삭제되었습니다.',
            deleted_product_ids: existingProductIds
        };
    } catch (error) {
        console.error('폴더에서 제품 삭제 중 오류 발생', error);
        throw error;
    }
};
