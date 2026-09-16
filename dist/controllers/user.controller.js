"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const user_service_js_1 = require("../services/user.service.js");
const response_js_1 = require("../utils/response.js");
const getUsers = async (_req, res, next) => {
    try {
        const users = await user_service_js_1.userService.getAllUsers();
        (0, response_js_1.sendSuccess)(res, users, 'Usuarios obtenidos correctamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res, next) => {
    try {
        const userId = Number(req.params.id);
        const user = await user_service_js_1.userService.getUserById(userId);
        (0, response_js_1.sendSuccess)(res, user, 'Usuario encontrado');
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res, next) => {
    try {
        const newUser = await user_service_js_1.userService.createUser(req.body);
        (0, response_js_1.sendCreated)(res, newUser, 'Usuario registrado con éxito');
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
const updateUser = async (req, res, next) => {
    try {
        const userId = Number(req.params.id);
        const updatedUser = await user_service_js_1.userService.updateUser(userId, req.body);
        (0, response_js_1.sendSuccess)(res, updatedUser, 'Usuario actualizado con éxito');
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        const userId = Number(req.params.id);
        await user_service_js_1.userService.deleteUser(userId);
        (0, response_js_1.sendSuccess)(res, { id: userId }, 'Usuario eliminado con éxito');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
