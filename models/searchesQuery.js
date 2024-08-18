const countSearchesQuery = (whereClause) =>
  `SELECT COUNT(*) as total FROM product ${whereClause}`;

const searchProductsQuery = (whereClause, orderClause) =>
  `SELECT product.id, product.name, product.won_price, product.en_price, product.image, 
          COUNT(review.id) as reviews, AVG(review.rating) as rating 
   FROM product 
   LEFT JOIN review ON product.id = review.product_id 
   ${whereClause} 
   GROUP BY product.id 
   ${orderClause} 
   LIMIT ? OFFSET ?`;

const popularSearchesQuery = `SELECT keyword FROM popular_searches 
   ORDER BY search_count DESC, last_searched_at DESC 
   LIMIT 10`;

export { countSearchesQuery, searchProductsQuery, popularSearchesQuery };

const getRecentSearchesQuery = `SELECT keyword FROM recent_searches 
WHERE user_id = ? 
ORDER BY searched_at DESC 
LIMIT 10`;

export {
  countSearchesQuery,
  searchProductsQuery,
  popularSearchesQuery,
  getRecentSearchesQuery,
};
