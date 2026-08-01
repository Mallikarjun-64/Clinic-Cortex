import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (plaintext) => {
  return await bcrypt.hash(plaintext, SALT_ROUNDS);
};

export const comparePassword = async (plaintext, hashed) => {
  return await bcrypt.compare(plaintext, hashed);
};
