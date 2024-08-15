import express from 'express';
import { insertSouvenir, insertTravel, insertPersonality } from '../models/onboardingDao.js';
import { successStatus } from '../config/successStatus.js';
import { errResponse } from '../config/response.js';
import { errStatus } from '../config/errorStatus.js';
import { response } from '../config/response.js';

const router = express.Router();

router.post('/', async (req,res)=> {
    const { userId, souvenirname, destination, personalityname } = req.body;
    const souvenirs = souvenirname ||  [];
    const destinations = destination || [];  
    const personalities= personalityname || [];
    
    // body로 id 
    // let user_id = 'Ap5BdCME9t9BpcJO3hOouKnoqchy8B3OFZ2y0FPOpCQ';
    
    console.log(userId, souvenirname, destination, personalityname )
    
    console.log('배열 확인',souvenirname.length, destination.length, personalityname.length )

    if (!userId || !Array.isArray(souvenirname) || !Array.isArray(destination) || !Array.isArray(personalityname)) {
        console.error('Validation Error:', { userId, souvenirname, destination, personalityname });
        return res.send(errResponse(errStatus.ONBOARDING_BAD_REQUEST));
    }
    if (souvenirs.length> 2 || destination.length > 3 || personalityname.length > 3 ) {
        console.error('Limit Exceeded:', { souvenirname, destination, personalityname });
        return res.send(errResponse(errStatus.ONBOARDING_LIMIT_EXCEEDED));
        
    }
    
   

    try {
        

        console.log('Saving data:', { userId, souvenirname, destination, personalityname });
        console.log(souvenirs,destinations,personalities);
        // 기념품 정보 저장 
        for (const souvenirname of souvenirs) {

            await insertSouvenir(userId, souvenirname);
        }
        
        // 여행 정보 저장
        for (const destination of destinations) {
            await insertTravel(userId, destination);
        }

        // 성향 정보 저장
        for (const personality of personalities ) {
            await insertPersonality(userId, personality);
        }

        res.send(response(successStatus.ONBOARDING_SUCCESS));
    } catch (err) {
        console.error('Database Error:', err);
        res.send(errResponse(errStatus.ONBOARDING_FAILED));
    }


});

export default router;