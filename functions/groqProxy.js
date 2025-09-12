import fetch from "node-fetch";

export async function handler(event, context) {
  const apiKey = process.env.GROQ_API_KEY;

  if (event.queryStringParameters.ping) {
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  }

  try {
    const groqRes = await fetch("https://api.groq.com/v1/query", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: event.body
    });

    const data = await groqRes.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Groq API request failed", details: error.message })
    };
  }
}

