import { prisma } from '../../../config/prisma';
import { ApiError } from '../../../utils/ApiError';
import { loginSchema } from './auth.validation';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { z } from 'zod';

type LoginData = z.infer<typeof loginSchema>['body'];

class AuthService {
  async login(data: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new ApiError(401, 'Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Email ou senha inválidos');
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return { token };
  }
}

export const authService = new AuthService();
