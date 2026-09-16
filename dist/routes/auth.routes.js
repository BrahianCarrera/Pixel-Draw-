"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const validate_js_1 = require("../middlewares/validate.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const auth_schema_js_1 = require("../schemas/auth.schema.js");
const router = (0, express_1.Router)();
// Registro de nuevo usuario
router.post('/register', (0, validate_js_1.validate)({ body: auth_schema_js_1.registerSchema }), auth_controller_js_1.register);
// Inicio de sesión (con email o username)
router.post('/login', (0, validate_js_1.validate)({ body: auth_schema_js_1.loginSchema }), auth_controller_js_1.login);
// Obtener perfil actual y estado de pareja
router.get('/me', auth_middleware_js_1.requireAuth, auth_controller_js_1.getMe);
exports.default = router;
