export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Hente siste data
    if (request.method === "GET" && url.pathname === "/api/latest") {
      const latestData = await env.DASHBOARD_KV.get("feed:latest");
      if (!latestData) {
        return new Response(JSON.stringify({ message: "No data available yet" }), { status: 404 });
      }
      return new Response(latestData, { headers: { "Content-Type": "application/json" } });
    }

    // Laste opp ny data (f.eks. fra ChatGPT-scheduling)
    if (request.method === "POST" && url.pathname === "/api/update") {
      try {
        const body = await request.json();
        const dateKey = `feed:${body.date}`;
        await env.DASHBOARD_KV.put(dateKey, JSON.stringify(body));
        await env.DASHBOARD_KV.put("feed:latest", JSON.stringify(body));
        return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 400 });
      }
    }

    // Alt annet
    return new Response("Cyber Defenders Worker Online", { status: 200 });
  },
};
