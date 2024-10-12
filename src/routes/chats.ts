import express, { Response, Request, NextFunction } from "express";
import PocketBase, { ClientResponseError } from "pocketbase";
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
      handleChatExists({ requestingUserId, targetUserId, pb, res });
    } catch (error: any) {
      console.log(
        "Error instanceof ClientResponseError ????",
        error instanceof ClientResponseError,
      );
      if (
        error instanceof ClientResponseError &&
        (error as ClientResponseError).status === 404
      ) {
        try {
          handle404({ requestingUserId, targetUserId, pb, res, error });
        } catch (error) {
          // If an error occurs while creating the chat, return an error response
          console.error("Error creating new chat:", error);
          res.status(500).json({
            error: "An error occurred while creating the new chat.",
          });
        }
      }
    }
    // } catch (error) {
    //   let chat;
    //   console.log(
    //     "MADE IT TO THE CATCH BLOCK",
    //     "Error instanceof ClientResponseError ????",
    //     error instanceof ClientResponseError,
    //   );
    //   if (
    //     error instanceof ClientResponseError &&
    //     (error as ClientResponseError).status === 404
    //   ) {
    //     console.error("No existing chat found. Create new chat:", error);
    //     chat = await pb.collection("chats").create({
    //       participants: [requestingUserId, targetUserId],
    //     });
    //     // Fetch messages associated with the chat
    //     const messages = await pb.collection("messages").getFullList({
    //       filter: `chatId = '${chat.id}'`,
    //       sort: "created",
    //     });
    //
    //     res.status(200).json({ chat, messages });
    //   }
    //
    //   console.error("Error initiating chat:", error);
    //   res
    //     .status(500)
    //     .json({ error: "An error occurred while initiating the chat." });
    // }
  },
);

async function handleChatExists(args: {
  requestingUserId: string;
  targetUserId: string;
  pb: PocketBase;
  res: Response;
}): Promise<void> {
  let existingChats;
  let chat;
  let messages;
  const { requestingUserId, targetUserId, pb, res } = args;

  try {
    // Check if a chat already exists between the two users
    existingChats = await pb.collection("chats").getFullList({
      // filter: `participants ?= '${requestingUserId}' && participants ?= '${targetUserId}'`,
      filter: pb.filter(
        "users.id ?= {:requestingUserId} && users.id ?= {:targetUserId}",
        { requestingUserId, targetUserId },
      ),
    });

    console.log("=========Existing Chats:===============", existingChats);
    if (existingChats) {
      if (existingChats.length > 0) {
        chat = existingChats[0];

        // Fetch messages associated with the chat
        messages = await pb.collection("messages").getFullList({
          filter: `chatId = '${chat.id}'`,
          sort: "created",
        });
      } else {
        // If no chat exists, create a new chat
        chat = await pb.collection("chats").create(
          {
            users: [requestingUserId, targetUserId],
          },
          { expand: "users" },
        );
        // Fetch messages associated with the chat after creating the chat (should be empty)
        messages = await pb.collection("messages").getFullList({
          filter: `chatId = '${chat.id}'`,
          sort: "created",
        });
      }
    }
    console.info("Returning chat and messages", chat, messages);
    res.status(201).json({ chat, messages });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while initiating the chat." });
  }
}

async function handle404(args: {
  requestingUserId: string;
  targetUserId: string;
  pb: PocketBase;
  res: Response;
  error: ClientResponseError;
}): Promise<void> {
  const { requestingUserId, targetUserId, pb, res, error } = args;
  // If no chat exists, create a new chat
  console.error("No existing chat found. Create new chat:", error);
  let chat;
  chat = await pb.collection("chats").create(
    {
      users: [requestingUserId, targetUserId],
    },
    { expand: "users" },
  );
  // Fetch messages associated with the chat
  const messages = await pb.collection("messages").getFullList({
    filter: `chatId = '${chat.id}'`,
    sort: "created",
  });

  res.status(200).json({ chat, messages });
}

export default router;
