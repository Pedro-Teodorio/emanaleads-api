"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = require("../../../utils/ApiError");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_repository_1 = require("./user.repository");
const project_repository_1 = require("../project/project.repository");
const SALT_ROUNDS = 10;
class UserService {
    async create(data) {
        const existingUser = await user_repository_1.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new ApiError_1.ApiError(400, 'Email já cadastrado');
        }
        // Se password fornecida, fazer hash e status ACTIVE. Caso contrário, manter sem senha e status INACTIVE para exigir ativação.
        const hashedPassword = data.password ? await bcrypt_1.default.hash(data.password, SALT_ROUNDS) : null;
        const user = await user_repository_1.userRepository.create({
            ...data,
            status: data.password ? 'ACTIVE' : 'INACTIVE',
        }, hashedPassword);
        return user;
    }
    async getById(id) {
        const user = await user_repository_1.userRepository.findById(id);
        if (!user) {
            throw new ApiError_1.ApiError(404, 'Usuário não encontrado');
        }
        return user;
    }
    async listUsersAsRoot(search, page = 1, limit = 10, roleFilter, statusFilter) {
        const where = {};
        if (roleFilter) {
            where.role = roleFilter;
        }
        else {
            where.role = { in: [client_1.SystemRole.ROOT, client_1.SystemRole.ADMIN] };
        }
        if (statusFilter) {
            where.status = statusFilter;
        }
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        const [users, total] = await Promise.all([user_repository_1.userRepository.list(where, page, limit), user_repository_1.userRepository.count(where)]);
        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateUserAsRoot(userId, data) {
        const targetUser = await this.getById(userId);
        const projectCount = await project_repository_1.projectRepository.count({ adminId: userId });
        if (targetUser.role === client_1.SystemRole.PROJECT_USER) {
            throw new ApiError_1.ApiError(403, 'Usuários ROOT não podem gerenciar membros de projeto diretamente.');
        }
        if (targetUser.role === client_1.SystemRole.ADMIN && projectCount > 0 && data.role === client_1.SystemRole.ROOT) {
            throw new ApiError_1.ApiError(403, 'Administradores com projetos não podem ser promovidos para ROOT.');
        }
        const dataToUpdate = {};
        if (data.name)
            dataToUpdate.name = data.name;
        if (data.email)
            dataToUpdate.email = data.email;
        if (data.phone)
            dataToUpdate.phone = data.phone;
        if (data.status)
            dataToUpdate.status = data.status;
        if (data.role)
            dataToUpdate.role = data.role;
        const updatedUser = await user_repository_1.userRepository.update(userId, dataToUpdate);
        return updatedUser;
    }
    async deleteUserAsRoot(userId) {
        const targetUser = await this.getById(userId);
        if (targetUser.role === client_1.SystemRole.PROJECT_USER) {
            throw new ApiError_1.ApiError(403, 'Usuários ROOT não podem gerenciar membros de projeto diretamente.');
        }
        await user_repository_1.userRepository.delete(userId);
        return { message: 'Usuário deletado com sucesso.' };
    }
    async resetPasswordAsAdmin(userId, newPassword) {
        const targetUser = await user_repository_1.userRepository.findById(userId);
        if (!targetUser) {
            throw new ApiError_1.ApiError(404, 'Usuário não encontrado');
        }
        // Hash da nova senha
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, SALT_ROUNDS);
        // Atualizar senha
        await user_repository_1.userRepository.updatePassword(userId, hashedNewPassword);
        return { message: 'Senha resetada com sucesso' };
    }
}
exports.userService = new UserService();
