"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var FleetService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FleetService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let FleetService = FleetService_1 = class FleetService {
    logger = new common_1.Logger(FleetService_1.name);
    fleetInstance;
    constructor() {
        this.fleetInstance = axios_1.default.create({
            baseURL: `${process.env.FLEET_URL}/api/v1/fleet`,
            headers: {
                Authorization: `Bearer ${process.env.FLEET_TOKEN}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 second timeout
        });
        // Add request/response interceptors for logging
        this.fleetInstance.interceptors.request.use((config) => {
            this.logger.debug(`FleetDM Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            this.logger.error('FleetDM Request Error:', error);
            return Promise.reject(error);
        });
        this.fleetInstance.interceptors.response.use((response) => {
            this.logger.debug(`FleetDM Response: ${response.status} ${response.config.url}`);
            return response;
        }, (error) => {
            this.logger.error(`FleetDM Response Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
            return Promise.reject(error);
        });
    }
    async getHostsByLabel(labelId) {
        try {
            const response = await this.fleetInstance.get(`/labels/${labelId}/hosts`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get hosts for label ${labelId}:`, error);
            throw new Error(`Failed to fetch hosts for label ${labelId}`);
        }
    }
    async getHostById(hostId) {
        try {
            const response = await this.fleetInstance.get(`/hosts/${hostId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get host ${hostId}:`, error);
            throw new Error(`Failed to fetch host ${hostId}`);
        }
    }
    async getMultipleHosts(hostIds) {
        try {
            const requests = hostIds.map((id) => this.getHostById(id));
            const responses = await Promise.all(requests);
            return responses.map((response) => response.host);
        }
        catch (error) {
            this.logger.error('Failed to get multiple hosts:', error);
            throw new Error('Failed to fetch multiple hosts');
        }
    }
};
exports.FleetService = FleetService;
exports.FleetService = FleetService = FleetService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FleetService);
