import jwt, { JwtPayload } from 'jsonwebtoken';

type AuthTokenPayload = JwtPayload & {
  userId: string;
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return secret;
};

export const signToken = (userId: string) => {
  return jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: '12h'
  });
};

export const verifyToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

  if (
    !decoded ||
    typeof decoded !== 'object' ||
    typeof decoded.userId !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }

  return decoded as AuthTokenPayload;
};
