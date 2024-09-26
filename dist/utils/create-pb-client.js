"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPocketBaseClient = createPocketBaseClient;
const request_auth_store_1 = require("./request-auth-store");
const pocketbase_1 = __importDefault(require("pocketbase"));
// PocketBase Client Factory Function
function createPocketBaseClient(token, pbUrl) {
    if (!token) {
        throw new Error("Access token is missing or invalid");
    }
    else if (!pbUrl) {
        throw new Error("PocketBase URL is missing");
    }
    const authStore = new request_auth_store_1.RequestAuthStore();
    authStore.save(token, null);
    const pb = new pocketbase_1.default(pbUrl, authStore);
    return pb;
}
