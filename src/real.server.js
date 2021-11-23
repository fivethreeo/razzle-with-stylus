import App from "./App";
import React from "react";
import express from "express";
import { renderToString } from "react-dom/server";
import ssrPrepass from "react-ssr-prepass";
import { StaticRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import {
  dehydrate,
  Hydrate,
  QueryClient,
  QueryClientProvider
} from "react-query";

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const cssLinksFromAssets = (public_path, assets, entrypoint) => {
  return assets[entrypoint]
    ? assets[entrypoint].css
      ? assets[entrypoint].css
          .map(
            (asset) => `<link rel="stylesheet" href="${public_path}${asset}">`
          )
          .join("")
      : ""
    : "";
};

const jsScriptTagsFromAssets = (
  public_path,
  assets,
  entrypoint,
  extra = ""
) => {
  return assets[entrypoint]
    ? assets[entrypoint].js
      ? assets[entrypoint].js
          .map(
            (asset) => `<script src="${public_path}${asset}"${extra}></script>`
          )
          .join("")
      : ""
    : "";
};

const server = express();

export const renderApp = async (req, res) => {
  const public_path = `https://${CODESANDBOX_HOST}/`;

  const context = {};
  const helmetContext = {};
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        suspense: true
      }
    }
  });
  let dehydratedState = dehydrate(queryClient);

  const PrepassedApp = (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={dehydratedState}>
        <StaticRouter context={context} location={req.url}>
          <HelmetProvider context={helmetContext}>
            <App />
          </HelmetProvider>
        </StaticRouter>
      </Hydrate>
    </QueryClientProvider>
  );

  await ssrPrepass(PrepassedApp);

  dehydratedState = dehydrate(queryClient);

  const markup = renderToString(PrepassedApp);
  const { helmet } = helmetContext;

  const html = `<!doctype html>
  <html lang="">
  <head>
      ${helmet.title.toString()}
      ${helmet.priority.toString()}
      ${helmet.meta.toString()}
      ${helmet.link.toString()}
      ${helmet.script.toString()}
      <meta name="viewport" content="width=device-width, initial-scale=1">
      ${cssLinksFromAssets(public_path, assets, "client")}
      <script type="text/javascript">
      window.PUBLIC_PATH = '${public_path}';
    </script>
  </head>
  <body>
    <div id="root">${markup}</div>
      ${jsScriptTagsFromAssets(
        public_path,
        assets,
        "client",
        "defer",
        "crossorigin"
      )}
      <script>
        window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState)};
    </script>
  </body>
</html>`;
  return { context, html };
};

server
  .disable("x-powered-by")
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get("/*", async (req, res) => {
    const { html, context } = await renderApp(req, res);

    if (context.url) {
      // Somewhere a `<Redirect>` was rendered
      return res.redirect(301, context.url);
    }

    res.send(html);
  });

export default server;
