import fs from 'fs/promises';
import path from 'path';
import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: 'wit-database-2.chcygck0gruw.ap-northeast-2.rds.amazonaws.com',
    user: 'root',
    password: '12345678',
    database: 'wit'
  });

  const filePath = path.resolve('products.json');

  try {
    const data = await fs.readFile(filePath, 'utf8');
    
    if (!data) {
      console.error('파일이 비어 있습니다.');
      return;
    }

    let products;
    try {
      products = JSON.parse(data);
    } catch (parseErr) {
      console.error('JSON 파싱 오류:', parseErr);
      return;
    }

    // 서브 카테고리 ID를 얻기 위한 쿼리
    const categoryQuery = `
      SELECT sc.sub_category_id
      FROM sub_category sc
      JOIN main_category mc ON sc.main_category_id = mc.main_category_id
      WHERE mc.main_category_name = ? AND sc.sub_category_name = ?
    `;

    // 제품을 삽입하기 위한 쿼리
    const insertQuery = `
      INSERT INTO product 
      (name, description, won_price, en_price, image, sales_area, manufacturing_country, product_type, sub_category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const product of products) {
      console.log(`처리 중인 제품: ${product.name}`);
      console.log(`메인 카테고리: ${product.main_category}`);
      console.log(`서브 카테고리: ${product.sub_category}`);

      // 서브 카테고리 ID를 가져오기 위해 쿼리 실행
      const [rows] = await connection.query(categoryQuery, [product.main_category, product.sub_category]);
      if (rows.length === 0) {
        console.error(`서브 카테고리를 찾을 수 없습니다: ${product.main_category} - ${product.sub_category}`);
        continue;
      }

      const subCategoryId = rows[0].sub_category_id;
      const wonPrice = parseInt(product.won_price.replace(/[^0-9]/g, ''), 10);
      const enPrice = parseInt(product.en_price.replace(/[^0-9]/g, ''), 10);

      const productTypeMap = {
        '식품': 'food',
        '뷰티코스메틱': 'cosmetic',
        '생활용품': 'household goods',
        '의약품': 'medicine'
      };

      const productType = productTypeMap[product.main_category] || 'unknown';

      try {
        await connection.query(insertQuery, [
          product.name,
          product.description,
          wonPrice,
          enPrice,
          product.image,
          product.sales_area,
          product.manufacturing_country,
          productType,
          subCategoryId
        ]);
        console.log(`제품 삽입 성공: ${product.name}`);
      } catch (err) {
        console.error('쿼리 실행 오류:', err);
      }
    }
    
  } catch (err) {
    console.error('파일 읽기 오류:', err);
  } finally {
    await connection.end();
  }
}

// 실행
main();
