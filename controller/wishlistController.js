import {
    getProductsInCart,
    createFolderWithProducts,
    addProductsToFolders,
    getUserFoldersFromDb,
    updateFolderNameInDb,
    deleteFoldersFromDb,
    getProductsInFolderFromDb,
    deleteProductsFromFolder
} from '../services/wishlistService.js';

// 장바구니에서 제품 목록 조회
export const getWishlist = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { cursor, limit } = req.query; // cursor와 limit을 쿼리 파라미터에서 받음

        if (!user_id) {
            return res.status(400).json({ message: 'user_id is required' });
        }

        const result = await getProductsInCart(user_id, cursor, parseInt(limit, 10) || 10);

        res.status(200).json({
            message: 'Products retrieved successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products in wishlist', error: error.message });
    }
};


// 유저가 생성한 폴더 조회
export const getUserFolders = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { cursor, limit } = req.query; // 커서와 limit을 쿼리 파라미터에서 받음

        if (!user_id) {
            return res.status(400).json({ message: 'user_id is required' });
        }

        const result = await getUserFoldersFromDb(user_id, parseInt(cursor, 10) || 0, parseInt(limit, 10) || 10);

        res.status(200).json({
            message: 'Folders retrieved successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving folders', error: error.message });
    }
};
// 폴더 생성
export const createFolder = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { product_ids, folder_name } = req.body;

        if (!user_id || !product_ids || !folder_name) {
            return res.status(400).json({ message: 'user_id, product_ids, and folder_name are required' });
        }

        const result = await createFolderWithProducts(user_id, product_ids, folder_name);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error creating folder', error: error.message });
    }
};

// 폴더 or 폴더들에 제품 추가
export const addProductsToFoldersController = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { folder_id, product_ids } = req.body;

        if (!user_id || !folder_id || !product_ids) {
            return res.status(400).json({ message: 'user_id, folder_id, 그리고 product_ids는 필수 항목입니다' });
        }

        // 폴더 ID와 제품 ID가 배열인지 확인
        if (!Array.isArray(folder_id) || !Array.isArray(product_ids)) {
            return res.status(400).json({ message: 'folder_id와 product_ids는 배열이어야 합니다' });
        }

        const result = await addProductsToFolders(folder_id, product_ids, user_id);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: '폴더에 제품 추가 중 오류 발생', error: error.message });
    }
};

// 폴더 이름 변경
export const updateFolderName = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { folder_id, new_folder_name } = req.body;

        if (!user_id || !folder_id || !new_folder_name) {
            return res.status(400).json({ message: 'user_id, folder_id, and new_folder_name are required' });
        }

        const result = await updateFolderNameInDb(user_id, folder_id, new_folder_name);

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: 'Folder name updated successfully',
                data: {
                    folder_id: folder_id,
                    folder_name: new_folder_name
                }
            });
        } else {
            res.status(404).json({ message: 'Folder not found or no changes made' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating folder name', error: error.message });
    }
};


// 다중 폴더 삭제
export const deleteFolders = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { folder_ids } = req.body;

        if (!user_id || !folder_ids) {
            return res.status(400).json({ message: 'user_id and folder_ids are required' });
        }

        const result = await deleteFoldersFromDb(user_id, folder_ids);

        res.status(200).json({
            message: 'Folders deleted successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting folders', error: error.message });
    }
};

// 폴더 내 상품 정보 조회
export const getProductsInFolder = async (req, res) => {
    try {
        const { folder_id, user_id } = req.params; // 요청 파라미터에서 folder_id와 user_id를 받아옴
        const { cursor = 0, limit = 10 } = req.query; // 쿼리 파라미터로 cursor와 limit을 받음

        if (!folder_id || !user_id) {
            return res.status(400).json({ message: 'folder_id and user_id are required' });
        }

        // 폴더 내 상품 정보를 조회
        const result = await getProductsInFolderFromDb(folder_id, user_id, parseInt(cursor), parseInt(limit));

        res.status(200).json({
            message: 'Products retrieved successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products in folder', error: error.message });
    }
};

// 폴더 내 상품 삭제
export const deleteProductsFromFolderController = async (req, res) => {
    try {
        const { folder_id } = req.params;
        const { product_ids } = req.body;

        if (!folder_id || !product_ids) {
            return res.status(400).json({ message: 'folder_id and product_ids are required' });
        }

        const result = await deleteProductsFromFolder(folder_id, product_ids);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting products from folder', error: error.message });
    }
};