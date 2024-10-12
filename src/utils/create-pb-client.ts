import { RequestAuthStore } from "./request-auth-store.js";
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

  try {
    const authStore = new RequestAuthStore();
    authStore.save(token, null);
    console.log("AuthStore:", authStore);
    const pb = new PocketBase(pbUrl, authStore);
    console.log("PocketBase client created. Returning pb instance:");
    pb.beforeSend = function (url, options) {
      // For list of the possible request options properties check
      // https://developer.mozilla.org/en-US/docs/Web/API/fetch#options
      options.headers = Object.assign({}, options.headers, {
        // "X-Custom-Header": "example",
      });
      console.log("beforeSend url", url);
      console.log("beforeSend options", options);

      return { url, options };
    };
    pb.afterSend = function (response, data) {
      // do something with the response state
      console.log("afterSend response", response);
      console.log("afterSend data", data);

      return Object.assign(data, {
        // extend the data...
        // additionalField: 123,
      });
    };
    return pb;
  } catch (err) {
    throw new Error("Error creating pocketbase client");
  }
}
