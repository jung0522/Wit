const createUserQuery =
  'INSERT INTO user (user_id, username, usernickname, gender, age, birth, social_login) VALUES (?, ?, ?, ?, ?, ?, ?)';

const findAllUserQuery = 'SELECT * FROM user';

const findOneUserQuery = 'SELECT * FROM user WHERE user_id = ?';

const updateUserQuery =
  'UPDATE user SET username = ?, usernickname = ?, gender = ?, age = ?, birth = ? WHERE user_id = ?';

const deleteUserQuery = 'DELETE FROM user WHERE user_id = ?';

export {
  createUserQuery,
  findAllUserQuery,
  findOneUserQuery,
  updateUserQuery,
  deleteUserQuery,
};
