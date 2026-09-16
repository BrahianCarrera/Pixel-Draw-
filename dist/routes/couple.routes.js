"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const couple_controller_js_1 = require("../controllers/couple.controller.js");
const validate_js_1 = require("../middlewares/validate.js");
const couple_schema_js_1 = require("../schemas/couple.schema.js");
const router = (0, express_1.Router)();
// Crear pareja y generar código de invitación
router.post('/', (0, validate_js_1.validate)({ body: couple_schema_js_1.createCoupleSchema }), couple_controller_js_1.createCouple);
// Unirse a una pareja existente usando código de invitación
router.post('/join', (0, validate_js_1.validate)({ body: couple_schema_js_1.joinCoupleSchema }), couple_controller_js_1.joinCouple);
// Salir / desvincularse de una pareja
router.post('/leave', (0, validate_js_1.validate)({ body: couple_schema_js_1.leaveCoupleSchema }), couple_controller_js_1.leaveCouple);
// Buscar pareja por código de invitación
router.get('/code/:code', (0, validate_js_1.validate)({ params: couple_schema_js_1.inviteCodeParamSchema }), couple_controller_js_1.getCoupleByInviteCode);
// Obtener la pareja de un usuario
router.get('/user/:userId', (0, validate_js_1.validate)({ params: couple_schema_js_1.userIdParamSchema }), couple_controller_js_1.getCoupleByUserId);
// Obtener datos de la pareja por su ID
router.get('/:id', (0, validate_js_1.validate)({ params: couple_schema_js_1.coupleIdParamSchema }), couple_controller_js_1.getCoupleById);
// Regenerar código de invitación (si aún no se ha unido la pareja)
router.post('/:id/regenerate-code', (0, validate_js_1.validate)({ params: couple_schema_js_1.coupleIdParamSchema, body: couple_schema_js_1.createCoupleSchema }), couple_controller_js_1.regenerateInviteCode);
exports.default = router;
