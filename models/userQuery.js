const createUserQuery =
  'INSERT INTO User (user_id, username, usernickname, gender, age, birth) VALUES (?, ?, ?, ?, ?, ?)';

const findAllUserQuery = 'SELECT * FROM User';

const findOneUserQuery = 'SELECT * FROM User WHERE user_id = ?';

const updateUserQuery =
  'UPDATE User SET username = ?, usernickname = ?, gender = ?, age = ?, birth = ? WHERE user_id = ?';

const deleteUserQuery = 'DELETE FROM User WHERE user_id = ?';

export {
  createUserQuery,
  findAllUserQuery,
  findOneUserQuery,
  updateUserQuery,
  deleteUserQuery,
};
