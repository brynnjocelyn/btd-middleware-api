"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestAuthStore = void 0;
const pocketbase_1 = require("pocketbase");
// Custom AuthStore that does not share state
class RequestAuthStore extends pocketbase_1.BaseAuthStore {
    constructor() {
        super();
    }
}
exports.RequestAuthStore = RequestAuthStore;
