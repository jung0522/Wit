import express from 'express';
import {
  insertSouvenir,
  insertTravel,
  insertPersonality,
} from '../models/onboardingDao.js';
import { successStatus } from '../config/successStatus.js';
import { errResponse } from '../config/response.js';
import { errStatus } from '../config/errorStatus.js';
import { response } from '../config/response.js';
import { decodeAccessToken } from '../middleware/jwtMiddleware.js';


export const onboardingRouter = express.Router();

onboardingRouter.post('/', decodeAccessToken, 
async (req, res) => {
  const { user_id } = req; 
  const { souvenirname, destination, personalityname } = req.body;
  const souvenirs = souvenirname || [];
  const destinations = destination || [];
  const personalities = personalityname || [];

  console.log('User ID:', user_id);
  console.log('Souvenirs:', souvenirs, 'Destinations:', destinations, 'Personalities:', personalities);


 
  if (
    !user_id ||
    !Array.isArray(souvenirname) ||
    !Array.isArray(destination) ||
    !Array.isArray(personalityname)
  ) {
    console.error('Validation Error:', {
      user_id,
      souvenirname,
      destination,
      personalityname,
    });
    return res.send(errResponse(errStatus.ONBOARDING_BAD_REQUEST));
  }
  if (
    souvenirs.length > 2 ||
    destination.length > 3 ||
    personalityname.length > 3
  ) {
    console.error('Limit Exceeded:', {
      souvenirname,
      destination,
      personalityname,
    });
    return res.send(errResponse(errStatus.ONBOARDING_LIMIT_EXCEEDED));
  }

  try {
    
    console.log(souvenirs, destinations, personalities);
    // 기념품 정보 저장
      if (souvenirs.length>0) {
      await insertSouvenir(user_id, souvenirs);
      }

    // 여행 정보 저장
      if (destinations.length>0) {
      await insertTravel(user_id, destinations);
      }

    // 성향 정보 저장
    if (personalities.length >0 ) {
      await insertPersonality(user_id,personalities);
    }

    res.send(response(successStatus.ONBOARDING_SUCCESS));
  } catch (err) {
    console.error('Database Error:', err);
    res.send(errResponse(errStatus.ONBOARDING_FAILED));
  }
});


