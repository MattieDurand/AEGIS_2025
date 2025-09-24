// netlify/functions/groq-proxy.js
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const apiKey = process.env.GROQ_API_KEY;

    // 🔴 TEMP DEBUG LOGS (remove later!)
    console.log("DEBUG: GROQ_API_KEY present?", !!apiKey);
    console.log("DEBUG: First 6 chars of key:", apiKey ? apiKey.slice(0, 6) + "..." : "NO KEY");

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing GROQ_API_KEY" }),
      };
    }

    const response = await fetch("https://api.groq.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`, // key stays hidden in client
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Groq Proxy Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to reach Groq API", details: err.message }),
    };
  }
}

