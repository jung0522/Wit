import {pool} from '../config/db-config.js';


const insertSouvenirQuery = (userId, souvenirs) => {
  const values = souvenirs.map(souvenir => `(${pool.escape(userId)}, ${pool.escape(souvenir)})`).join(',');
  return `INSERT INTO souvenir (user_id, souvenir_name) VALUES ${values}`;
};

const insertTravelQuery = (userId, destinations) => {
  const values = destinations.map(destination => `(${pool.escape(userId)}, ${pool.escape(destination)})`).join(',');
  return `INSERT INTO travel (user_id, destination) VALUES ${values}`;
};

const insertPersonalityQuery = (userId, personalities) => {
  const values = personalities.map(personality => `(${pool.escape(userId)}, ${pool.escape(personality)})`).join(',');
  return `INSERT INTO personality (user_id, personality_name) VALUES ${values}`;
};

export {insertSouvenirQuery, insertTravelQuery, insertPersonalityQuery}; 