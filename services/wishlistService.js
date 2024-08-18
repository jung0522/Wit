import { pool } from '../config/db-config.js';

// 폴더 생성 서비스
export const createFolderWithProducts = async (userId, product_ids, folder_name) => {
    try {
        const [folderResult] = await pool.query(
            'INSERT INTO folder (name, created_by_user) VALUES (?, ?)', 
            [folder_name, userId]
        );

        const folderId = folderResult.insertId;

        for (const productId of product_ids) {
            await pool.query(
                'INSERT INTO cart_folder_product (folder_id, product_id) VALUES (?, ?)', 
                [folderId, productId]
            );
        }

        const [products] = await pool.query(
            `SELECT p.id AS product_id, p.name, p.en_price, p.won_price, p.image, p.manufacturing_country
             FROM product p
             JOIN cart_folder_product cfp ON p.id = cfp.product_id
             WHERE cfp.folder_id = ?`,
            [folderId]
        );

        return {
            message: 'Folder created successfully',
            data: {
                folderId,
                folder_name,
                products
            }
        };
    } catch (error) {
        console.error('Error creating folder', error);
        throw error;
    }
};

// 장바구니에서 제품 조회 서비스
export const getProductsInCart = async (userId) => {
    try {
        const [cart] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);

        if (cart.length === 0) {
            return { count: 0, products: [] };
        }

        const cartId = cart[0].id;

        const [products] = await pool.query(
            `SELECT p.id AS product_id, p.name, p.en_price, p.won_price, p.image, p.manufacturing_country
             FROM product p
             JOIN cart_folder_product cfp ON p.id = cfp.product_id
             JOIN folder f ON cfp.folder_id = f.id
             WHERE f.cart_id = ?
             GROUP BY p.id`,
            [cartId]
        );

        return {
            count: products.length,
            products
        };
    } catch (error) {
        console.error('Error retrieving products from cart', error);
        throw error;
    }
};

// 유저가 생성한 폴더 조회 서비스
export const getUserCreatedFolders = async (userId) => {
    try {
        const [folders] = await pool.query('SELECT * FROM folder WHERE created_by_user = ?', [userId]);

        if (folders.length === 0) {
            return { count: 0, folders: [] };
        }

        const foldersWithProducts = await Promise.all(folders.map(async folder => {
            const [products] = await pool.query(
                `SELECT p.id AS product_id, p.name, p.en_price, p.won_price, p.image, p.manufacturing_country
                 FROM product p
                 JOIN cart_folder_product cfp ON p.id = cfp.product_id
                 WHERE cfp.folder_id = ?`,
                [folder.id]
            );

            return {
                folder_id: folder.id,
                folder_name: folder.name,
                products
            };
        }));

        return {
            count: foldersWithProducts.length,
            folders: foldersWithProducts
        };
    } catch (error) {
        console.error('Error retrieving user-created folders', error);
        throw error;
    }
};

// 폴더 이름 변경 서비스
export const updateFolderNameInDb = async (userId, folderId, newFolderName) => {
    try {
        const [result] = await pool.query(
            `UPDATE folder
             SET name = ?
             WHERE id = ? AND created_by_user = ?`,
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
             WHERE id IN (?) AND created_by_user = ?`,
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

// 폴더 내 상품 정보 조회 서비스
export const getProductsInFolderFromDb = async (folderId) => {
    try {
        const [products] = await pool.query(
            `SELECT p.id AS product_id, p.name, p.en_price, p.won_price, p.image, p.manufacturing_country
             FROM product p
             JOIN cart_folder_product cfp ON p.id = cfp.product_id
             WHERE cfp.folder_id = ?`,
            [folderId]
        );

        return {
            count: products.length,
            products
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