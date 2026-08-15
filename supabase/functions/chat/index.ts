// Deno Edge Function — the only place @google/generative-ai is called from.
// GEMINI_API_KEY never reaches the client. Auth is enforced at the platform
// level (see supabase/config.toml [functions.chat] verify_jwt = true), so a
// request only reaches this handler once its JWT is verified.
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@^0.21.0';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DESIGN_SPEC.md § Content Tone & Voice
const SYSTEM_PROMPT = `You are VectorFit's AI personal trainer. Tone: friendly and
motivational without being overly casual; explain form/fitness concepts
clearly and technically but simply; personalize advice using the user's
name, goals, and progress when given; celebrate wins and normalize
struggles. Keep replies concise and actionable.`;

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

function isValidMessages(value: unknown): value is IncomingMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (m) =>
        typeof m === 'object' &&
        m !== null &&
        (m as IncomingMessage).role !== undefined &&
        ((m as IncomingMessage).role === 'user' || (m as IncomingMessage).role === 'assistant') &&
        typeof (m as IncomingMessage).content === 'string' &&
        (m as IncomingMessage).content.trim().length > 0 &&
        (m as IncomingMessage).content.length <= 4000
    )
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!isValidMessages(messages)) {
    return new Response(JSON.stringify({ error: 'messages must be a non-empty array of {role, content}' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const latest = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(latest.content);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('Gemini request failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to generate a response' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
