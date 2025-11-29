"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    async login(req, res, next) {
        try {
            const { token } = await auth_service_1.authService.login(req.body);
            res.cookie('auth-token', token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24, // 1 dia
                sameSite: 'strict',
            });
            res.status(200).json({ message: 'Login realizado com sucesso' });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            res.clearCookie('auth-token', {
                httpOnly: true,
                sameSite: 'strict',
            });
            res.status(200).json({ message: 'Logout realizado com sucesso' });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new Error('Usuário não autenticado');
            }
            const result = await auth_service_1.authService.changePassword(req.user.id, req.body);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const result = await auth_service_1.authService.forgotPassword(req.body);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { token } = req.params;
            const result = await auth_service_1.authService.resetPassword(token, req.body);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async activateAccount(req, res, next) {
        try {
            const { token } = req.params;
            const result = await auth_service_1.authService.activateAccount(token, req.body);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.authController = new AuthController();
