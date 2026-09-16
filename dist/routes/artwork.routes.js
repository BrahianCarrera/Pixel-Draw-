"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const artwork_controller_js_1 = require("../controllers/artwork.controller.js");
const validate_js_1 = require("../middlewares/validate.js");
const artwork_schema_js_1 = require("../schemas/artwork.schema.js");
const router = (0, express_1.Router)();
// Crear un nuevo dibujo y compartirlo a la pareja
router.post('/', (0, validate_js_1.validate)({ body: artwork_schema_js_1.createArtworkSchema }), artwork_controller_js_1.createArtwork);
// Obtener la galería de dibujos de la pareja (con paginación)
router.get('/couple/:coupleId', (0, validate_js_1.validate)({ params: artwork_schema_js_1.coupleParamSchema, query: artwork_schema_js_1.coupleArtworksQuerySchema }), artwork_controller_js_1.getCoupleArtworks);
// Obtener el último dibujo enviado/activo de la pareja (ideal para widgets / pantalla principal)
router.get('/couple/:coupleId/latest', (0, validate_js_1.validate)({ params: artwork_schema_js_1.coupleParamSchema }), artwork_controller_js_1.getLatestArtwork);
// Obtener un dibujo específico por su ID
router.get('/:id', (0, validate_js_1.validate)({ params: artwork_schema_js_1.artworkIdParamSchema }), artwork_controller_js_1.getArtworkById);
// Modificar un dibujo existente (nombre o cuadrícula)
router.patch('/:id', (0, validate_js_1.validate)({ params: artwork_schema_js_1.artworkIdParamSchema, body: artwork_schema_js_1.updateArtworkSchema }), artwork_controller_js_1.updateArtwork);
// Eliminar un dibujo
router.delete('/:id', (0, validate_js_1.validate)({ params: artwork_schema_js_1.artworkIdParamSchema }), artwork_controller_js_1.deleteArtwork);
exports.default = router;
