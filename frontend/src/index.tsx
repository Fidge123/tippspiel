import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <RecoilRoot>
      <BrowserRouter basename="tippspiel">
        <App />
      </BrowserRouter>
    </RecoilRoot>
  </StrictMode>
);
