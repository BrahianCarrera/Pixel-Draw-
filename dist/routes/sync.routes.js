"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sync_controller_js_1 = require("../controllers/sync.controller.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
// Obtener estado sincronizado en tiempo real (usuario, pareja actual y último dibujo)
router.get('/', auth_middleware_js_1.requireAuth, sync_controller_js_1.getSyncStatus);
exports.default = router;
