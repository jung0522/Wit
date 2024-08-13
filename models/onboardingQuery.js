const insertSouvenirQuery = `
  INSERT INTO souvenir (user_id, souvenir_name) VALUES (?, ?);
`;

const insertTravelQuery = `
  INSERT INTO travel (user_id, destination) VALUES (?, ?);
`;

const insertPersonalityQuery = `
  INSERT INTO personality (user_id, personality_name) VALUES (?, ?);
`;

export {insertSouvenirQuery, insertTravelQuery, insertPersonalityQuery}; 