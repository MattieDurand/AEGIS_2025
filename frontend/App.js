import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const [status, setStatus] = useState("Click to Begin Setup");

  const handleSetup = async () => {
    setStatus("Setting up...");
    try {
      const response = await axios.get("/.netlify/functions/groqProxy?ping=true");
      if (response.data.ok) {
        setStatus("Setup complete ✅ — ready for diagnosis");
      } else {
        setStatus("Setup failed ❌");
      }
    } catch (err) {
      setStatus("Error contacting server ❌");
    }
  };

  return (
    <div className="app">
      <h1>AEGIS Online Doctor</h1>
      <button onClick={handleSetup}>Begin Setup</button>
      <p>{status}</p>
    </div>
  );
}

