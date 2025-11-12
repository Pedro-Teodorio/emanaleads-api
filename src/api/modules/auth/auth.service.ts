import { ApiError } from '../../../utils/ApiError';
import { loginSchema } from './auth.validation';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { z } from 'zod';
import { userRepository } from '../user/user.repository';

type LoginData = z.infer<typeof loginSchema>['body'];

class AuthService {
	async login(data: LoginData) {
		const user = await userRepository.findByEmail(data.email);

		if (!user || !user.password) {
			throw new ApiError(401, 'Email ou senha inválidos');
		}

		const isPasswordValid = await bcrypt.compare(data.password, user.password);

		if (!isPasswordValid) {
			throw new ApiError(401, 'Email ou senha inválidos');
		}

		const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET as jwt.Secret, {
			expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
		});

		return { token };
	}
}

export const authService = new AuthService();
