import * as bcrypt from 'bcrypt';

const handleHashPassword = async (password: string) => {
  const saltOrRounds = 10;
  const hashPassword = await bcrypt.hash(password, saltOrRounds);
  return hashPassword;
};
export default handleHashPassword;
