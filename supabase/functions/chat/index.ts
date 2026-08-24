// Deno Edge Function — the only place @google/generative-ai is called from.
// GEMINI_API_KEY never reaches the client. Auth is verified manually below
// (see supabase/config.toml [functions.chat] verify_jwt = false) rather than
// at the platform level: platform-level verify_jwt rejects the CORS
// preflight OPTIONS request — which never carries an Authorization header —
// before it reaches this file, breaking every browser call.
import { createClient } from 'npm:@supabase/supabase-js@^2.112.3';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@^0.21.0';
import { withRetry } from './retry.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// DESIGN_SPEC.md § Content Tone & Voice
const SYSTEM_PROMPT = `You are VectorFit's AI personal trainer. Tone: friendly and
motivational without being overly casual; explain form/fitness concepts
clearly and technically but simply; personalize advice using the user's
name, goals, and progress when given; celebrate wins and normalize
struggles. Keep replies concise and actionable. If you ever get asked to provide a workout plan,
respond with a short, high-level outline of the plan and a few example exercises,
but do not provide a full plan. Only talk about exercises and fitness;
do not give medical advice or discuss nutrition or talk about anything else. avoid generic,
vague, or repetitive responses; do not make up information or give advice that could be unsafe.
avoid using filler phrases like "as an AI language model" or "I'm not a medical professional."
avoid apologizing for not being able to provide information. If you don't know the answer, say so.
avoid using the user's name in a way that could be interpreted as creepy or invasive.
dont use emojis or other non-text characters as well as empty words like greetings.
max response length: 500 characters.`;

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

  if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing bearer token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
      status: 401,
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
      // Alias, not a dated snapshot (e.g. gemini-2.0-flash) — Google retires
      // dated model versions over time, which turns a hardcoded name into a
      // silent 404 well after this code was written. flash-lite over
      // flash-latest: much higher free-tier daily quota, less exposed to
      // demand-related 503s.
      model: 'gemini-flash-lite-latest',
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const latest = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await withRetry(() => chat.sendMessageStream(latest.content));

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
