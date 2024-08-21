import express from 'express';
import passport from 'passport';
import { response } from '../config/response.js';
import { successStatus } from '../config/successStatus.js';
import { getHome,getProductByCategoryID } from '../services/homeService.js';

const homeRouter = express.Router();


// 카테고리 추천
homeRouter.get('/', async (req, res) => {
    //main_cateogryID와 cateogry를 통해 가져올 count
    const { count } = req.query;
    console.log(count)
    
    let query = '';
    let params = [];

    try {
        const homeMainResponse = await getHome(count);
        res.send(response(successStatus.HOME_SUCCESS, homeMainResponse));
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
homeRouter.get('/category', async (req, res) => {
    //main_cateogryID와 cateogry를 통해 가져올 count
    const { category, count } = req.query;
    console.log(category,count)
    
    let query = '';
    let params = [];

    try {
        const homeMainResponse = await getProductByCategoryID(category,count);
        res.send(response(successStatus.HOME_SUCCESS, homeMainResponse));
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

export default homeRouter;