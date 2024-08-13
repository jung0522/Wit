const createUserQuery =
  'INSERT INTO user (private_user_key, username, usernickname, gender, age, birth, social_login) VALUES (?, ?, ?, ?, ?, ?, ?)';

const findAllUserQuery = 'SELECT * FROM user';

const findUserRealIdQuery =
  'SELECT user_id FROM user WHERE private_user_key = ?';

const findOneUserQuery = 'SELECT * FROM user WHERE user_id = ?';

const updateUserQuery =
  'UPDATE user SET username = ?, usernickname = ?, gender = ?, age = ?, birth = ? WHERE user_id = ?';

const deleteUserQuery = 'DELETE FROM user WHERE user_id = ?';

export {
  createUserQuery,
  findAllUserQuery,
  findUserRealIdQuery,
  findOneUserQuery,
  updateUserQuery,
  deleteUserQuery,
};
