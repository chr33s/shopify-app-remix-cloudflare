import { createRequestHandler } from "react-router";

import { sessionStorage } from "~/shopify.server";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			ctx: ExecutionContext;
			env: Env;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
	async fetch(request, env, ctx) {
    sessionStorage.setNamespace(env.SESSIONS);
		return requestHandler(request, {
      cloudflare: {
        env,
        ctx,
      },
    });
	},
} satisfies ExportedHandler<Env>;
