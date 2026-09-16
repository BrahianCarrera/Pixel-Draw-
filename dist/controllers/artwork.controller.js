"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArtwork = exports.updateArtwork = exports.getArtworkById = exports.getLatestArtwork = exports.getCoupleArtworks = exports.createArtwork = void 0;
const artwork_service_js_1 = require("../services/artwork.service.js");
const response_js_1 = require("../utils/response.js");
const createArtwork = async (req, res, next) => {
    try {
        const artwork = await artwork_service_js_1.artworkService.createArtwork(req.body);
        (0, response_js_1.sendCreated)(res, artwork, 'Dibujo compartido con éxito a tu pareja');
    }
    catch (error) {
        next(error);
    }
};
exports.createArtwork = createArtwork;
const getCoupleArtworks = async (req, res, next) => {
    try {
        const coupleId = Number(req.params.coupleId);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = await artwork_service_js_1.artworkService.getCoupleArtworks(coupleId, page, limit);
        (0, response_js_1.sendSuccess)(res, result, 'Galería de dibujos obtenida correctamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getCoupleArtworks = getCoupleArtworks;
const getLatestArtwork = async (req, res, next) => {
    try {
        const coupleId = Number(req.params.coupleId);
        const latest = await artwork_service_js_1.artworkService.getLatestArtwork(coupleId);
        (0, response_js_1.sendSuccess)(res, latest, 'Último dibujo de la pareja obtenido');
    }
    catch (error) {
        next(error);
    }
};
exports.getLatestArtwork = getLatestArtwork;
const getArtworkById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const artwork = await artwork_service_js_1.artworkService.getArtworkById(id);
        (0, response_js_1.sendSuccess)(res, artwork, 'Dibujo encontrado');
    }
    catch (error) {
        next(error);
    }
};
exports.getArtworkById = getArtworkById;
const updateArtwork = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const updated = await artwork_service_js_1.artworkService.updateArtwork(id, req.body);
        (0, response_js_1.sendSuccess)(res, updated, 'Dibujo actualizado con éxito');
    }
    catch (error) {
        next(error);
    }
};
exports.updateArtwork = updateArtwork;
const deleteArtwork = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await artwork_service_js_1.artworkService.deleteArtwork(id);
        (0, response_js_1.sendSuccess)(res, { id }, 'Dibujo eliminado con éxito');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteArtwork = deleteArtwork;
