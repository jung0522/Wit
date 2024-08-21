import { pool } from '../config/db-config.js';
// import * as onboardingQuery from '../models/onboardingQuery.js';
import { insertSouvenirQuery, insertTravelQuery, insertPersonalityQuery } from '../models/onboardingQuery.js';


export const insertSouvenir = async (userId, souvenirs) => {
  const query=insertSouvenirQuery(userId,souvenirs);
    try {
      const [result] = await pool.query(query);
      return result;
    } catch (err) {
      console.error('Failed to insert souvenir:', err);
      throw err;
    }
  };

  
  export const insertTravel = async (userId, destinations) => {
    const query=insertTravelQuery(userId, destinations);
    try {
      const [result] = await pool.query(query);
      return result;
    } catch (err) {
      console.error('Failed to insert travel:', err);
      throw err;
    }
  };
  
  export const insertPersonality = async (userId, personalities) => {
    const query=insertPersonalityQuery(userId,personalities);
    try {
      const [result] = await pool.query(query);

      return result.insertId;
    } catch (err) {
      console.error('Failed to insert personality:', err);
      throw err;
    }
  };