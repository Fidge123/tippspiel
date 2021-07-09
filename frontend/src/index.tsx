import React from "react";
import ReactDOM from "react-dom";
import { env } from "process";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.render(
  <Auth0Provider
    domain={env.AUTH0_DOMAIN || "withered-salad-9484.eu.auth0.com"}
    clientId={env.AUTH0_CLIENT || "VvT2n6cFCwL1pCTAxWdmZJuVPDwOGl3r"}
    cacheLocation="localstorage"
    scope="openid email profile read:tipp write:tipp write:schedule"
    useRefreshTokens
    redirectUri={window.location.href}
    audience={env.AUTH0_AUDIENCE || "https://nfl-tippspiel.herokuapp.com/auth"}
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Auth0Provider>,
  document.getElementById("root")
);
