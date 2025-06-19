// app/api/forward-to-webhook/route.ts
export async function POST(req: Request) {
    const body = await req.text(); // or req.json() if it's JSON
    const response = await fetch("https://webhook.site/3afb15f6-03fd-463a-bbb1-ca67c8150fd9", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // or match the original headers
      },
      body,
    });
  
    const text = await response.text(); // Webhook.site returns plain text
    return new Response(text, { status: response.status });
  }
  