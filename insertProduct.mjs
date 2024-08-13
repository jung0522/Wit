/* DB에 json 파일 넣기 위한 코드였음 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';  // `mysql2/promise` 모듈을 사용하여 async/await를 지원

// 데이터베이스 연결 설정
const connection = await mysql.createConnection({
  host: 'wit-database-2.chcygck0gruw.ap-northeast-2.rds.amazonaws.com', // 데이터베이스 호스트
  user: 'root',      // 데이터베이스 사용자
  password: '12345678',  // 데이터베이스 비밀번호
  database: 'wit'  // 데이터베이스 이름
});

const filePath = path.resolve('products.json');

// JSON 파일 읽기
fs.readFile('products.json', 'utf8', async (err, data) => {
  if (err) {
    console.error('파일 읽기 오류:', err);
    return;
  }

  if (!data) {
    console.error('파일이 비어 있습니다.');
    return;
  }

  // JSON 파싱
  let products;
  try {
    products = JSON.parse(data);
  } catch (parseErr) {
    console.error('JSON 파싱 오류:', parseErr);
    return;
  }


  // INSERT 문 생성
  let insertQuery = 'INSERT INTO product (id, name, description, won_price, en_price, image, sales_area, product_type) VALUES ';

  const values = products.map((product, index) => {
    return `(${index + 1}, '${product.name}', '${product.description}', ${parseInt(product.won_price.replace(/[^0-9]/g, ''))}, ${parseInt(product.en_price.replace(/[^0-9]/g, ''))}, '${product.image}', '${product.sales_area}', '${product.product_type}')`;
  });

  insertQuery += values.join(', ');

  // 데이터베이스에 쿼리 실행
  try {
    const [results] = await connection.execute(insertQuery);
    console.log('데이터 삽입 성공:', results);
  } catch (err) {
    console.error('쿼리 실행 오류:', err);
  }

  // 연결 종료
  await connection.end();
});
