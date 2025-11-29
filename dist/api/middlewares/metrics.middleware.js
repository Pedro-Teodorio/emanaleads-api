"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsMiddleware = void 0;
exports.getMetricsSnapshot = getMetricsSnapshot;
const logger_1 = require("../../utils/logger");
const state = {
    totalRequests: 0,
    totalErrors: 0,
    totalLatencyMs: 0,
};
const metricsMiddleware = (req, res, next) => {
    const start = process.hrtime.bigint();
    state.totalRequests += 1;
    res.on('finish', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1000000;
        state.totalLatencyMs += durationMs;
        if (res.statusCode >= 500) {
            state.totalErrors += 1;
        }
    });
    next();
};
exports.metricsMiddleware = metricsMiddleware;
// Log periódico a cada 60s
setInterval(() => {
    const avgLatencyMs = state.totalRequests ? state.totalLatencyMs / state.totalRequests : 0;
    const snapshot = {
        totalRequests: state.totalRequests,
        totalErrors: state.totalErrors,
        avgLatencyMs: +avgLatencyMs.toFixed(2),
    };
    logger_1.logger.info(snapshot, 'metrics:snapshot');
}, 60000).unref();
function getMetricsSnapshot() {
    const avgLatencyMs = state.totalRequests ? state.totalLatencyMs / state.totalRequests : 0;
    return {
        totalRequests: state.totalRequests,
        totalErrors: state.totalErrors,
        avgLatencyMs: +avgLatencyMs.toFixed(2),
    };
}
