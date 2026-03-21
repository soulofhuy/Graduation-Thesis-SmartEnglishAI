import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';

class AuthService {
  constructor(private readonly db = prisma) {}

  registerUser = async (email: string, password: string) => {
    const existingUser = await this.db.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.db.$transaction(async tx => {
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword
        }
      });

      await tx.profile.create({
        data: {
          userId: createdUser.id
        }
      });

      return createdUser;
    });

    return user;
  };

  findUserById = async (id: string) => {
    return this.db.user.findUnique({
      where: { id }
    });
  };

  findUserByEmail = async (email: string) => {
    return this.db.user.findUnique({
      where: { email }
    });
  };

  loginUser = async (email: string, password: string) => {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    const token = signToken(user.id);
    return { user, token };
  };
}

export default new AuthService();
