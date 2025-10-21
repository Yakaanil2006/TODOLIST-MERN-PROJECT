import React from "react";
import Localdb from "./components/Localdb";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000ff, #000000ff)",
        padding: "20px",
      }}
    >
      <Localdb />
    </div>
  );
}

export default App;
