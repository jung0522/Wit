//카테고리 별로 가져오기
export const getPopularProductsByCategoryQuery = `
SELECT
    p.sales_area,
    p.id AS product_id,
    p.name AS product_name,
    p.won_price,
    p.en_price,
    p.image,
    COUNT(wish.product_id) AS wish_count,
    mc.main_category_name,
    CASE WHEN user_heart.product_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_heart,
    COUNT(r.id) AS review_count,
    COALESCE(AVG(r.rating), 0) AS average_rating
FROM
    product p
JOIN
    sub_category sc ON p.sub_category_id = sc.sub_category_id
JOIN
    main_category mc ON sc.main_category_id = mc.main_category_id
LEFT JOIN
    mine wish ON p.id = wish.product_id
LEFT JOIN
    user_heart ON p.id = user_heart.product_id AND user_heart.user_id = 37
LEFT JOIN
    review r ON p.id = r.product_id
WHERE
    mc.main_category_id = ?
GROUP BY
    p.id, p.name, p.won_price, p.en_price, p.image, mc.main_category_name, user_heart.product_id
ORDER BY
    wish_count DESC
LIMIT ?;


`;

//특정 카테고리 별로 상품 불러오기 이거 써야함
export const getPopularProductsByEachCategoryQuery = `
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.won_price,
    p.en_price,
    p.image,
    COUNT(wish.product_id) AS wish_count,
    mc.main_category_name
FROM 
    product p
JOIN
    sub_category sc ON p.sub_category_id = sc.sub_category_id
JOIN
    main_category mc ON sc.main_category_id = mc.main_category_id
LEFT JOIN
    mine wish ON p.id = wish.product_id
WHERE
    mc.main_category_id = ?
GROUP BY 
    p.id, mc.main_category_name
ORDER BY 
    wish_count DESC
LIMIT ?;

`;

//전체로 가져오기
export const getPopularProductsByALLCategoryQuery = `
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.won_price,
    p.en_price,
    p.image,
    COUNT(wish.product_id) AS wish_count
FROM 
    product p
LEFT JOIN 
    mine wish ON p.id = wish.product_id
GROUP BY 
    p.id
ORDER BY 
    wish_count DESC
LIMIT ?;


`;

export const getNyamRecommendQuery = `
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.won_price,
    p.en_price,
    p.image,
    COUNT(wish.product_id) AS wish_count,
    mc.main_category_name,
    CASE WHEN user_heart.product_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_heart,
    COUNT(r.id) AS review_count,
    COALESCE(AVG(r.rating), 0) AS average_rating
FROM
    product p
JOIN
    sub_category sc ON p.sub_category_id = sc.sub_category_id
JOIN
    main_category mc ON sc.main_category_id = mc.main_category_id
LEFT JOIN
    mine wish ON p.id = wish.product_id
LEFT JOIN
    user_heart ON p.id = user_heart.product_id AND user_heart.user_id = 37
LEFT JOIN
    review r ON p.id = r.product_id
WHERE
    mc.main_category_name = '식품'  -- 대분류가 "식품"인 경우
GROUP BY
    p.id, p.name, p.won_price, p.en_price, p.image, mc.main_category_name, user_heart.product_id
ORDER BY
    wish_count DESC
LIMIT 20;
`;
