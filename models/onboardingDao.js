import { pool } from '../config/db-config.js';
// import * as onboardingQuery from '../models/onboardingQuery.js';
import { insertSouvenirQuery, insertTravelQuery, insertPersonalityQuery } from '../models/onboardingQuery.js';


export const insertSouvenir = async (userId, souvenirName) => {
    try {
      console.log('Executing insertSouvenir query with:', { userId, souvenirName });
      const [result] = await pool.query(insertSouvenirQuery, [userId, souvenirName]);
      console.log(await pool.query(insertSouvenirQuery, [userId, souvenirName]));
      console.log('Souvenir insert result:', result);
      return result.insertId;
    } catch (err) {
      console.error('Failed to insert souvenir:', err);
      throw err;
    }
  };
  
  export const insertTravel = async (userId, destination) => {
    try {
      console.log('Executing insertTravel query with:', { userId, destination });
      const [result] = await pool.query(insertTravelQuery, [userId, destination]);
      console.log('Travel insert result:', result);
      return result.insertId;
    } catch (err) {
      console.error('Failed to insert travel:', err);
      throw err;
    }
  };
  
  export const insertPersonality = async (userId, personalityName) => {
    try {
      console.log('Executing insertPersonality query with:', { userId, personalityName });
      const [result] = await pool.query(insertPersonalityQuery, [userId, personalityName]);
      console.log('Personality insert result:', result);
      return result.insertId;
    } catch (err) {
      console.error('Failed to insert personality:', err);
      throw err;
    }
  };