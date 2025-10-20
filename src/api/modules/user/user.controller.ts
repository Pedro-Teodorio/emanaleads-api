import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';

class UserController {
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const newUser = await userService.create(req.body);
			res.status(201).json(newUser);
		} catch (error) {
			next(error); 
		}
	}

	async getMe(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				return next(new ApiError(401, 'Não autorizado'));
			}
			const user = await userService.getById(req.user.id);
			res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	}
}

export const userController = new UserController();
