export const getPopularProductsByCategoryQuery = `
SELECT 
    p.id,
    p.name,
    p.description,
    p.sub_category_id,
    AVG(r.rating) AS average_rating,
    COUNT(r.rating) AS review_count
FROM product p
LEFT JOIN review r ON p.id = r.id
GROUP BY p.id, p.name, p.description, p.sub_category_id
HAVING 
    COUNT(r.rating) >= 0 AND 
    AVG(r.rating) >= 0
ORDER BY RAND()
LIMIT 20;
`;