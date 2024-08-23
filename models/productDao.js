import { pool } from '../config/db-config.js';
import { errStatus } from '../config/errorStatus.js';
import { BaseError } from '../config/error.js';
import { getAllNoticesQuery } from './noticeQuery.js';
import {getPopularProductsByCategoryQuery,getPopularProductsByALLCategoryQuery,getNyamRecommendQuery,getRecommendUserQuery} from './productQuery.js';


// 카테고리별 인기 있는 상품을 한 번에 가져오기
export const getALLProductByALLCategory = async (count,userId, cursor = null) => {
  const connection = await pool.getConnection(); // 데이터베이스 연결
  try {
      const categories = ['ALL', '식품', '뷰티코스메틱', '의약품', '생활용품'];
      const groupedProducts = {};

      // 각 카테고리에 대해 쿼리 실행
      for (let category of categories) {
          let rows;

          if (category === 'ALL') { // 전체 카테고리 인기 상품
              [rows] = await pool.query(getPopularProductsByALLCategoryQuery, [parseInt(count, 10)]);
          } else { // 특정 카테고리 인기 상품
              // 특정 카테고리 ID를 매핑 (예: 식품 = 1, 뷰티코스메틱 = 2 등)
              const categoryId = getCategoryIdByName(category);
              [rows] = await pool.query(getPopularProductsByCategoryQuery, [userId,categoryId,cursor, parseInt(count, 10)]);
          }

          // 현재 카테고리의 상품 목록을 담을 배열 초기화
          groupedProducts[category] = [];

          // 쿼리 결과를 그룹화하여 해당 카테고리에 추가
          rows.forEach(product => {
              groupedProducts[category].push({
                  id: product.product_id,
                  name: product.product_name,
                  won_price: product.won_price,
                  en_price: product.en_price,
                  image: product.image,
                  sales_area : product.sales_area,
                  wish_count: product.wish_count,
                  is_heart: product.is_heart ? true : false, // is_heart가 true일 경우 true, 아니면 false
                  review_count : product.review_count ? 0 : 0,
                  review_avg : product.average_rating ? 0 : 0
              });
          });
      }

      return groupedProducts;
  } catch (error) {
      console.error("Error fetching popular products for all categories:", error);
      throw new Error('Internal Server Error');
  } finally {
      if (connection) connection.release(); // 연결 해제
  }
};

// 카테고리 이름을 카테고리 ID로 변환하는 헬퍼 함수
function getCategoryIdByName(categoryName) {
  const categoryMap = {
      '식품': 1,
      '뷰티코스메틱': 2,
      '의약품': 3,
      '생활용품': 4
  };
  return categoryMap[categoryName];
}


export const getPopularProductsByCategory = async (category, count, cursor = null) => {
    const connection = await pool.getConnection(); // 데이터베이스 연결
    try {
        let rows;
        
        if (parseInt(category) === 0) { // 전체 카테고리 인기 상품
            if (cursor) {
                rows = await connection.query(getPopularProductsByCategoryQuery, [cursor, parseInt(count, 10)]);
            } else {
                rows = await connection.query(getPopularProductsByALLCategoryQuery, [parseInt(count, 10)]);
            }
        } else { // 특정 카테고리 인기 상품
            if (cursor) {
                rows = await connection.query(getPopularProductsByCategoryQuery, [parseInt(category, 10), cursor, parseInt(count, 10)]);
            } else {
                rows = await connection.query(getPopularProductsByCategoryQuery, [parseInt(category, 10), parseInt(count, 10)]);
            }
        }

        const products = rows[0];

        // 데이터 구조를 카테고리별로 그룹화하여 반환
        const groupedProducts = {};
        let lastCursor = null;  // 새로운 커서

        products.forEach(product => {
            let categoryName;
            if (parseInt(category) === 0) categoryName = "ALL";
            else categoryName = product.main_category_name;

            if (!groupedProducts[categoryName]) {
                groupedProducts[categoryName] = [];
            }
            
            groupedProducts[categoryName].push({
                id: product.product_id,
                name: product.product_name,
                won_price: product.won_price,
                en_price: product.en_price,
                image: product.image,
                wish_count: product.wish_count,
                is_heart: product.is_heart ? true : false, // is_heart가 true일 경우 true, 아니면 false
                review_count: product.review_count || 0,
                review_avg: product.average_rating || 0
            });

            lastCursor = product.product_id; // 다음 커서로 사용할 마지막 상품 ID
        });

        return {
            groupedProducts,
            cursor: lastCursor,  // 다음 요청에서 사용할 수 있는 커서 반환
        };
    } catch (error) {
        console.error("Error fetching popular products by category:", error);
        throw new Error('Internal Server Error');
    } finally {
        if (connection) connection.release(); // 연결 해제
    }
};


  

// 냠냠 인기 있는 상품 가져오기
export const getNyamRecommendByUser = async (count) => {
  const connection = await pool.getConnection(); // 데이터베이스 연결
  try {
      let rows;
      let category;
      [rows] = await pool.query(getNyamRecommendQuery,[parseInt(count, 10)])


      
      return rows;
  } catch (error) {
      console.error("Error fetching popular products by category:", error);
      throw new Error('Internal Server Error');
  } finally {
      if (connection) connection.release(); // 연결 해제
  }
};


// 유저 추천 상품 가져오기
export const getRecommendForUser = async (userId, count) => {
    const connection = await pool.getConnection(); // 데이터베이스 연결
    try {
        const [rows] = await pool.query(getRecommendUserQuery, [parseInt(userId, 10), parseInt(count, 10)]);
        return rows;
    } catch (error) {
        console.error("Error fetching recommended products by user:", error);
        throw new Error('Internal Server Error');
    } finally {
        if (connection) connection.release(); // 연결 해제
    }
  };
  