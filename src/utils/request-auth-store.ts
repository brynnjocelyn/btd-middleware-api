import { BaseAuthStore } from "pocketbase";

// Custom AuthStore that does not share state
export class RequestAuthStore extends BaseAuthStore {
  constructor() {
    super();
  }
}
