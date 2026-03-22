import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { Role } from '../generated/prisma/enums';

class AuthService {
  static registerUser = async (email: string, password: string, role: Role) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async tx => {
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role
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

  static findUserById = async (id: string) => {
    return prisma.user.findUnique({
      where: { id }
    });
  };

  static findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
      where: { email }
    });
  };

  static loginUser = async (email: string, password: string) => {
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

export default AuthService;
