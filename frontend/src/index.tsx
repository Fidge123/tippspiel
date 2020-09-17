import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.render(
  <Auth0Provider
    domain="withered-salad-9484.eu.auth0.com"
    clientId="VvT2n6cFCwL1pCTAxWdmZJuVPDwOGl3r"
    cacheLocation="localstorage"
    scope="openid email profile read:tipp write:tipp"
    useRefreshTokens
    redirectUri={window.location.href}
    audience="https://nfl-tippspiel.herokuapp.com/auth"
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Auth0Provider>,
  document.getElementById("root")
);
