"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const appError_js_1 = require("../utils/appError.js");
const validate = (schema) => {
    return async (req, _res, next) => {
        try {
            if ('safeParse' in schema && typeof schema.safeParse === 'function') {
                const parsed = await schema.parseAsync(req.body);
                req.body = parsed;
                return next();
            }
            const compositeSchema = schema;
            if (compositeSchema.body) {
                req.body = await compositeSchema.body.parseAsync(req.body);
            }
            if (compositeSchema.query) {
                const parsedQuery = (await compositeSchema.query.parseAsync(req.query));
                Object.defineProperty(req, 'query', {
                    value: parsedQuery,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            }
            if (compositeSchema.params) {
                const parsedParams = (await compositeSchema.params.parseAsync(req.params));
                try {
                    req.params = parsedParams;
                }
                catch {
                    Object.defineProperty(req, 'params', {
                        value: parsedParams,
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    });
                }
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                return next(new appError_js_1.AppError('Error de validación en los datos enviados', 400, formattedErrors));
            }
            next(error);
        }
    };
};
exports.validate = validate;
