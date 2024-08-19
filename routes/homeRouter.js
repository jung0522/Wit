import express from 'express';
import passport from 'passport';
import { response } from '../config/response.js';
import { successStatus } from '../config/successStatus.js';
import { getHome } from '../services/homeService.js';

const homeRouter = express.Router();


// 카테고리 추천
homeRouter.get('/', async (req, res) => {
    const category = req.query.category;
    console.log(category);
    try {
        const homeMainResponse = await getHome();
        res.send(response(successStatus.HOME_SUCCESS, homeMainResponse));
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

export default homeRouter;