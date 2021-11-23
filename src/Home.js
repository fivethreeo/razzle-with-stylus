import React, { useState } from "react";
import logo from "./react.svg";
import "./Home.css";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useQuery } from "react-query";

import SSRSuspense from "./SSRSuspense";

const Home = () => {
  const [title, setTitle] = useState("title");
  const { isLoading, error, data, isFetching } = useQuery("todosData", () => {
    return axios
      .get("https://jsonplaceholder.typicode.com/todos/1")
      .then((res) => ({ title: "new title" }));
  });
  return (
    <div className="Home">
      <Helmet prioritizeSeoTags>
        <meta
          property="og:title"
          content={data && data.title ? data.title : title}
        />
      </Helmet>
      <div className="Home-header">
        <img src={logo} className="Home-logo" alt="logo" />
        <h2>Welcome to Razzle</h2>
      </div>
      <p className="Home-intro">
        To get started, edit <code>src/App.js</code> or
        <code>src/Home.js</code> and save to reload.
      </p>
      <ul className="Home-resources">
        <li>
          <a href="https://github.com/jaredpalmer/razzle">Docs</a>
        </li>
        <li>
          <a href="https://github.com/jaredpalmer/razzle/issues">Issues</a>
        </li>
        <li>
          <a href="https://palmer.chat">Community Slack</a>
        </li>
      </ul>
    </div>
  );
};

const SuspendedHome = () => {
  return (
    <SSRSuspense fallback={<h1>Loading Home</h1>}>
      <Home />
    </SSRSuspense>
  );
};
export default SuspendedHome;
