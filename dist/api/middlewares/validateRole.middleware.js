"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRole = void 0;
const ApiError_1 = require("../../utils/ApiError");
/**
 * Middleware para verificar se o usuário logado possui um dos papéis (roles) necessários.
 * @param roles Array de SystemRole (ex: ['ROOT', 'ADMIN'])
 */
const validateRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError_1.ApiError(401, 'Não autorizado. Token não fornecido.'));
        }
        const userRole = req.user.role;
        if (!roles.includes(userRole)) {
            return next(new ApiError_1.ApiError(403, 'Acesso negado. Você não tem permissão para este recurso.'));
        }
        next();
    };
};
exports.validateRole = validateRole;
