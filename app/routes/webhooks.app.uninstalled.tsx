import type { ActionFunctionArgs } from "react-router";
import { authenticate, sessionStorage } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    const sessionIds = await sessionStorage
      .findSessionsByShop(shop)
      .then((sessions) => sessions.map((session) => session.id));
    await sessionStorage.deleteSessions(sessionIds)
  }

  return new Response();
};
