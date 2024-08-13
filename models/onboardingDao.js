import { pool } from '../config/db-config.js';
import * as onboardingQuery from '../models/onboardingQuery.js';


const insertSouvenir= async(userId, souvenirname) => {
    const [result]= await pool.query(onboardingQuery.insertSouvenirQuery, [userId,souvenirname]);
    return result.insertId;
}

const insertTravel = async(userId, destination) => {
    const [result]= await pool.query(onboardingQuery.insertTravelQuery, [userId, destination]);
    return result.insertId;
}

const insertPersonality = async(userId, personalityname) => {
const [result]= await pool.query(onboardingQuery.insertPersonalityQuery, [userId, personalityname]);
    return result.insertId;

}

export {insertSouvenir, insertTravel, insertPersonality};