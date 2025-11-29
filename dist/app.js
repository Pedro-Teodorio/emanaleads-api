"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = require("./api/routes");
const errorHandler_1 = require("./api/middlewares/errorHandler");
const requestLogger_middleware_1 = require("./api/middlewares/requestLogger.middleware");
const metrics_middleware_1 = require("./api/middlewares/metrics.middleware");
const app = (0, express_1.default)();
exports.app = app;
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(metrics_middleware_1.metricsMiddleware);
app.use(requestLogger_middleware_1.requestLogger);
app.use('/api', routes_1.apiRoutes);
app.use(errorHandler_1.errorHandler);
