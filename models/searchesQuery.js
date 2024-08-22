const countSearchesQuery = (whereClause) =>
  `SELECT COUNT(*) as total FROM product ${whereClause}`;

  // review float 타입으로 
  const searchProductsQuery = (whereClause, orderClause) => `
  WITH OrderedProducts AS (
    SELECT 
      product.id, 
      product.name, 
      product.won_price, 
      product.en_price, 
      product.image, 
      COUNT(review.id) as reviews, 
      CAST(AVG(review.rating) AS FLOAT) as rating, 
      CASE WHEN user_heart.product_id IS NOT NULL THEN TRUE ELSE FALSE END as is_heart,
      ROW_NUMBER() OVER (${orderClause}) as row_num
    FROM 
      product 
    LEFT JOIN 
      review ON product.id = review.product_id 
    LEFT JOIN 
      user_heart ON product.id = user_heart.product_id AND user_heart.user_id = ?
    ${whereClause} 
    GROUP BY 
      product.id
  )
  SELECT * FROM OrderedProducts WHERE row_num > ? LIMIT ? ;
`;


const popularSearchesQuery = `SELECT keyword FROM popular_searches 
   ORDER BY search_count DESC, last_searched_at DESC 
   LIMIT 10`;

const getRecentSearchesQuery = `SELECT keyword FROM recent_searches 
WHERE user_id = ? 
ORDER BY searched_at DESC 
LIMIT 10`;

const deleteRecentSearchQuery = `
  DELETE FROM recent_searches 
  WHERE user_id = ? AND keyword = ? 

`;

const deleteAllRecentSearchesQuery = `
  DELETE FROM recent_searches 
  WHERE user_id = ?;
`;

export {
  countSearchesQuery,
  searchProductsQuery,
  popularSearchesQuery,
  getRecentSearchesQuery,
  
  deleteRecentSearchQuery,
  deleteAllRecentSearchesQuery,
};
