import React from "react";
import "./App.css";
import LoginButton from "./Login";
import LogoutButton from "./Login";

function App() {
  const user = null;
  return (
    <div className="App">
      <header className="App-header">
        {user ? <LogoutButton /> : <LoginButton />}
      </header>
    </div>
  );
}

export default App;
