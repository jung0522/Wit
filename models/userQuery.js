const createUser =
  'INSERT INTO User (usernickname, gender, age) VALUES (?, ?, ?)';

const findAllUser = 'SELECT * FROM User';

const findOneUser = 'SELECT * FROM User WHERE id = ?';

const updateUser =
  'UPDATE User SET usernickname = ?, username = ? birth = ? gender = ? WHERE id = ?';

const deleteUser = 'DELETE FROM User WHERE id = ?';
