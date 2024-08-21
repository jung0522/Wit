const createUserDto = (userData) => {
  return {
    id: userData.id,
    name: userData.name,
    nickname: userData.nickname,
    gender:
      userData.gender === 'M' || userData.gender === 'male' ? 'male' : 'female',
    age: userData.age,
    birthday: userData.birthday,
    social_login: userData.social_login,
  };
};

const updateUserDto = (userData) => {
  return {
    username: userData.username,
    usernickname: userData.usernickname,
    gender:
      userData.gender === 'M' || userData.gender === 'male' ? 'male' : 'female',
    age: userData.age,
    birth: userData.birth,
  };
};

export { createUserDto, updateUserDto };
