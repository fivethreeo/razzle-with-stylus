import App from "./App";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { hydrate } from "react-dom";
import { HelmetProvider } from "react-helmet-async";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";

const dehydratedState = window.__REACT_QUERY_STATE__;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true
    }
  }
});

hydrate(
  <QueryClientProvider client={queryClient}>
    <Hydrate state={dehydratedState}>
      <BrowserRouter>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </BrowserRouter>
    </Hydrate>
  </QueryClientProvider>,
  document.getElementById("root")
);

if (module.hot) {
  module.hot.accept();
}
