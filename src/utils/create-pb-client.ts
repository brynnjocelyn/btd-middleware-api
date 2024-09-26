import { RequestAuthStore } from "./request-auth-store";
import PocketBase from "pocketbase";

// PocketBase Client Factory Function
export function createPocketBaseClient(
  token: string,
  pbUrl: string,
): PocketBase {
  if (!token) {
    throw new Error("Access token is missing or invalid");
  } else if (!pbUrl) {
    throw new Error("PocketBase URL is missing");
  }

  const authStore = new RequestAuthStore();
  authStore.save(token, null);
  const pb = new PocketBase(pbUrl, authStore);
  return pb;
}
