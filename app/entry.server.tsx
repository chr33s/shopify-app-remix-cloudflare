/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { addDocumentResponseHeaders } from "./shopify.server";

export const streamTimeout = 10000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext
) {
  addDocumentResponseHeaders(request, responseHeaders);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), streamTimeout + 1000);

  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: controller.signal,
      onError(error: unknown) {
        if (!controller.signal.aborted) {
          // Log streaming rendering errors from inside the shell
          console.error(error);
        }
        responseStatusCode = 500;
      },
    },
  );

  body.allReady.then(() => clearTimeout(timeoutId));

  const userAgent = request.headers.get("user-agent");
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
