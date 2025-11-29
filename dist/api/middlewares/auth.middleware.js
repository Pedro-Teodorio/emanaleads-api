"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const ApiError_1 = require("../../utils/ApiError");
const authMiddleware = (req, res, next) => {
    const authCookie = req.cookies['auth-token'];
    if (!authCookie) {
        return next(new ApiError_1.ApiError(401, 'Token não fornecido'));
    }
    jsonwebtoken_1.default.verify(authCookie, env_1.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new ApiError_1.ApiError(401, 'Token inválido'));
        }
        req.user = decoded;
        return next();
    });
};
exports.authMiddleware = authMiddleware;
