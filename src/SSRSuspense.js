import React from "react";

const SSRSuspense =
  typeof window !== "undefined"
    ? React.Suspense
    : ({ children, ...props }) => children;

export default SSRSuspense;
