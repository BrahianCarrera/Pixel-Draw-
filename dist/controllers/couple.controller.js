"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveCouple = exports.regenerateInviteCode = exports.getCoupleByInviteCode = exports.getCoupleByUserId = exports.getCoupleById = exports.joinCouple = exports.createCouple = void 0;
const couple_service_js_1 = require("../services/couple.service.js");
const response_js_1 = require("../utils/response.js");
const createCouple = async (req, res, next) => {
    try {
        const couple = await couple_service_js_1.coupleService.createCouple(req.body.userId);
        (0, response_js_1.sendCreated)(res, couple, 'Pareja creada con éxito y código de invitación generado');
    }
    catch (error) {
        next(error);
    }
};
exports.createCouple = createCouple;
const joinCouple = async (req, res, next) => {
    try {
        const couple = await couple_service_js_1.coupleService.joinCouple(req.body.userId, req.body.inviteCode);
        (0, response_js_1.sendSuccess)(res, couple, 'Te has unido a la pareja exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.joinCouple = joinCouple;
const getCoupleById = async (req, res, next) => {
    try {
        const coupleId = Number(req.params.id);
        const couple = await couple_service_js_1.coupleService.getCoupleById(coupleId);
        (0, response_js_1.sendSuccess)(res, couple, 'Pareja encontrada');
    }
    catch (error) {
        next(error);
    }
};
exports.getCoupleById = getCoupleById;
const getCoupleByUserId = async (req, res, next) => {
    try {
        const userId = Number(req.params.userId);
        const couple = await couple_service_js_1.coupleService.getCoupleByUserId(userId);
        (0, response_js_1.sendSuccess)(res, couple, 'Pareja del usuario obtenida correctamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getCoupleByUserId = getCoupleByUserId;
const getCoupleByInviteCode = async (req, res, next) => {
    try {
        const code = String(req.params.code);
        const couple = await couple_service_js_1.coupleService.getCoupleByInviteCode(code);
        (0, response_js_1.sendSuccess)(res, couple, 'Información del código de invitación encontrada');
    }
    catch (error) {
        next(error);
    }
};
exports.getCoupleByInviteCode = getCoupleByInviteCode;
const regenerateInviteCode = async (req, res, next) => {
    try {
        const coupleId = Number(req.params.id);
        const couple = await couple_service_js_1.coupleService.regenerateInviteCode(coupleId, req.body.userId);
        (0, response_js_1.sendSuccess)(res, couple, 'Nuevo código de invitación generado con éxito');
    }
    catch (error) {
        next(error);
    }
};
exports.regenerateInviteCode = regenerateInviteCode;
const leaveCouple = async (req, res, next) => {
    try {
        const result = await couple_service_js_1.coupleService.leaveCouple(req.body.userId);
        (0, response_js_1.sendSuccess)(res, result, result.message);
    }
    catch (error) {
        next(error);
    }
};
exports.leaveCouple = leaveCouple;
