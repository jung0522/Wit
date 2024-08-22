import express from 'express';
import passport from 'passport';
import { response } from '../config/response.js';
import { successStatus } from '../config/successStatus.js';
import { getHome,getProductByCategoryID,getNyamRecommend,getRecommend } from '../services/homeService.js';
import {
    decodeAccessToken,
  } from '../middleware/jwtMiddleware.js';

const homeRouter = express.Router();


// 카테고리 추천
homeRouter.get('/', decodeAccessToken,async (req, res) => {
    //main_cateogryID와 cateogry를 통해 가져올 count
    const { count } = req.query;
    console.log(count)
            //유저 정보 가져오는 로직 추가해애함.
            const { user_id } = req;


    try {
        const homeMainResponse = await getHome(count,user_id);
        res.send(response(successStatus.HOME_SUCCESS, homeMainResponse));
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
homeRouter.get('/category',decodeAccessToken,async (req, res) => {
    // main_categoryID와 category를 통해 가져올 count 및 cursor
    const { category, count, cursor } = req.query;
    console.log(category, count, cursor);
    
    // 유저 정보 가져오는 로직 추가 (예시로 user_id를 53으로 설정)
    const {user_id} = req;

    try {
        // getProductByCategoryID에 cursor 값을 추가로 전달
        const { user, groupedProducts, cursor: newCursor } = await getProductByCategoryID(category, count, user_id, cursor);
        
        // 응답에 새로운 cursor 포함
        res.send(response(successStatus.HOME_SUCCESS, { user, groupedProducts, cursor: newCursor }));
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});



homeRouter.get('/nyam',decodeAccessToken, async (req, res) => {
    try {
        const { count } = req.query;
                //유저 정보 가져오는 로직 추가해애함.
                const { user_id } = req;
                console.log(user_id)
        const homeMainResponse = await getNyamRecommend(count,user_id);
        res.send(response(successStatus.HOME_SUCCESS, homeMainResponse));
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
homeRouter.get('/recommend',decodeAccessToken, async (req, res) => {
    try {
        const { count } = req.query;
                //유저 정보 가져오는 로직 추가해애함.
                const { user_id } = req;
        const homeMainResponse = await getRecommend(count,user_id);
        res.send(response(successStatus.HOME_SUCCESS, homeMainResponse));
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
export default homeRouter;