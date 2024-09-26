import express, { Response, Request, NextFunction } from "express";
const router = express.Router();

router.post(
  "/initiate",
  async (req: Request, res: Response, _next: NextFunction) => {
    const requestingUserId = req.user?.id; // Get user id from request
    const { targetUserId } = req.body;
    const pb = req.pb!;

    if (!targetUserId || !requestingUserId) {
      return res
        .status(400)
        .json({ error: "Both RequestingUserId && Target user id is required" });
    }

    try {
      // Check if a chat already exists between the two users
      const existingChats = await pb.collection("chat").getFullList({
        filter: `participants ?= '${requestingUserId}' && participants ?= '${targetUserId}'`,
      });
      let chat;
      if (existingChats.length > 0) {
        chat = existingChats[0];
      } else {
        // Create a new chat record
        chat = await pb.collection("chat").create({
          participants: [requestingUserId, targetUserId],
        });
      }
      // Fetch messages associated with the chat
      const messages = await pb.collection("messages").getFullList({
        filter: `chatId = '${chat.id}'`,
        sort: "created",
      });

      res.status(200).json({ chat, messages });
    } catch (error) {
      console.error("Error initiating chat:", error);
      res
        .status(500)
        .json({ error: "An error occurred while initiating the chat." });
    }
  },
);

export default router;
