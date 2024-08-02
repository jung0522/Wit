const createUserQuery =
  'INSERT INTO User (username, usernickname, gender, age, birth) VALUES (?, ?, ?, ?, ?)';

const findAllUserQuery = 'SELECT * FROM User';

const findOneUserQuery = 'SELECT * FROM User WHERE id = ?';

const updateUserQuery =
  'UPDATE User SET username = ?, usernickname = ?, gender = ?, age = ?, birth = ? WHERE id = ?';

const deleteUserQuery = 'DELETE FROM User WHERE id = ?';

export {
  createUserQuery,
  findAllUserQuery,
  findOneUserQuery,
  updateUserQuery,
  deleteUserQuery,
};
