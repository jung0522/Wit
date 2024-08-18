import {
    getProductsInCart,
    createFolderWithProducts,
    getUserCreatedFolders,
    updateFolderNameInDb,
    deleteFoldersFromDb,
    getProductsInFolderFromDb,
    deleteProductsFromFolder
} from '../services/wishlistService.js';

// 장바구니에서 제품 목록 조회
export const getWishlist = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({ message: 'user_id is required' });
        }

        const result = await getProductsInCart(user_id);

        res.status(200).json({
            message: 'Products retrieved successfully',
            data: result // 제품 개수와 목록 반환
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products from cart', error: error.message });
    }
};

// 유저가 생성한 폴더 조회
export const getUserFolders = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({ message: 'user_id is required' });
        }

        const result = await getUserCreatedFolders(user_id);

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
        const { folder_id } = req.params;

        if (!folder_id) {
            return res.status(400).json({ message: 'folder_id is required' });
        }

        const result = await getProductsInFolderFromDb(folder_id);

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