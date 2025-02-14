import { compareSync } from 'bcrypt';

export const comparePassword = async (
  password: string,
  hashPassword: string,
) => {
  return await compareSync(password, hashPassword);
};
