"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post("/initiate", (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const requestingUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get user id from request
    const { targetUserId } = req.body;
    const pb = req.pb;
    if (!targetUserId || !requestingUserId) {
        return res
            .status(400)
            .json({ error: "Both RequestingUserId && Target user id is required" });
    }
    try {
        // Check if a chat already exists between the two users
        const existingChats = yield pb.collection("chat").getFullList({
            filter: `participants ?= '${requestingUserId}' && participants ?= '${targetUserId}'`,
        });
        let chat;
        if (existingChats.length > 0) {
            chat = existingChats[0];
        }
        else {
            // Create a new chat record
            chat = yield pb.collection("chat").create({
                participants: [requestingUserId, targetUserId],
            });
        }
        // Fetch messages associated with the chat
        const messages = yield pb.collection("messages").getFullList({
            filter: `chatId = '${chat.id}'`,
            sort: "created",
        });
        res.status(200).json({ chat, messages });
    }
    catch (error) {
        console.error("Error initiating chat:", error);
        res
            .status(500)
            .json({ error: "An error occurred while initiating the chat." });
    }
}));
exports.default = router;
