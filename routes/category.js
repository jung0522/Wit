import { Router } from 'express';
import { pool } from '../config/db-config.js';
import { response, errResponse } from '../config/response.js';
import { BadRequestError } from '../config/CustomErrors.js';

const router = Router();

// 카테고리 불러오기 (대분류 및 소분류)
router.get('/', async (req, res, next) => {
  try {
    const mainCategoriesQuery = 'SELECT * FROM main_category';
    const subCategoriesQuery = 'SELECT * FROM sub_category';

    const [mainCategories] = await pool.query(mainCategoriesQuery);
    const [subCategories] = await pool.query(subCategoriesQuery);

    // mainCategories가 비어 있을 경우에도 빈 리스트 반환
    const categories = mainCategories.map(mainCategory => {
      return {
        main_category_id: mainCategory.main_category_id,
        main_category_name: mainCategory.main_category_name,
        subCategories: subCategories.filter(subCategory => subCategory.main_category_id === mainCategory.main_category_id).map(subCategory => ({
          sub_category_id: subCategory.sub_category_id,
          sub_category_name: subCategory.sub_category_name
        }))
      };
    });

    const responseData = response({
      isSuccess: true,
      code: 200,
      message: 'Categories retrieved successfully'
    }, { mainCategories: categories });

    return res.status(200).json(responseData);
  } catch (err) {
    console.log(err)
  }
});

export default router;
