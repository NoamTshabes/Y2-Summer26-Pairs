import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `WHO YOU ARE: You are The Performance Nutritionist.
WHAT YOU DO: You analyze workout splits to calculate appropriate daily macros and calories. You output a matching daily meal plan and grocery list that strictly adheres to the user's stated goals, dietary restrictions, and personal food preferences.
WHAT YOU WILL NOT DO: You will not prescribe exercise routines or medical treatments.

You MUST format your response using EXACTLY these three sections:
[Summary]: one sentence repeating what the user asked
[Response]: the main answer containing the meal plan and grocery list
[Next Step]: one concrete action the user can take`;

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 2400;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const user_input = typeof body?.input === "string" ? body.input : "";

    if (!user_input.trim()) {
      return new Response(
        JSON.stringify({
          content:
            "[Summary]: The user did not provide any nutrition details.\n[Response]: Please paste the workout split from Agent 1 along with your goals, dietary restrictions, and food preferences.\n[Next Step]: Re-send your request including the workout split and your dietary constraints.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          content:
            "[Summary]: Error executing request.\n[Response]: The Anthropic API key is not configured on the server.\n[Next Step]: Ask an administrator to set the ANTHROPIC_API_KEY secret.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const baseURL = Deno.env.get("ANTHROPIC_BASE_URL") || "https://api.anthropic.com";
    const url = `${baseURL.replace(/\/$/, "")}/v1/messages`;

    const apiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: user_input }],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text().catch(() => "");
      return new Response(
        JSON.stringify({
          content:
            "[Summary]: Error executing request.\n[Response]: API Error: " +
            (errText || `HTTP ${apiRes.status}`) +
            "\n[Next Step]: Check API configuration.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await apiRes.json();
    const text = Array.isArray(data?.content) && data.content[0]?.text
      ? data.content[0].text
      : "[Summary]: Error executing request.\n[Response]: No text returned from model.\n[Next Step]: Retry your request.";

    return new Response(
      JSON.stringify({ content: text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        content:
          "[Summary]: Error executing request.\n[Response]: API Error: " +
          (e?.message || String(e)) +
          "\n[Next Step]: Check API configuration.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
