"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignController = void 0;
const campaign_service_1 = require("./campaign.service");
class CampaignController {
    constructor() {
        this.create = async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const created = await campaign_service_1.campaignService.create(projectId, { ...req.body, projectId }, req.user);
                res.status(201).json(created);
            }
            catch (err) {
                next(err);
            }
        };
        this.list = async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const result = await campaign_service_1.campaignService.list({ ...req.query, projectId }, req.user);
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const { projectId, campaignId } = req.params;
                const c = await campaign_service_1.campaignService.getById(projectId, campaignId, req.user);
                res.json(c);
            }
            catch (err) {
                next(err);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const { projectId, campaignId } = req.params;
                const updated = await campaign_service_1.campaignService.update(projectId, campaignId, req.body, req.user);
                res.json(updated);
            }
            catch (err) {
                next(err);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const { projectId, campaignId } = req.params;
                await campaign_service_1.campaignService.delete(projectId, campaignId, req.user);
                res.status(204).send();
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.campaignController = new CampaignController();
