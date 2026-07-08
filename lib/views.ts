import { kv } from "@vercel/kv";

const VIEW_KEY = "transporter-globe:views";
const COUNT_API_NAMESPACE = "davidtphung";
const COUNT_API_KEY = "transporter-globe";

function hasKv() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getCountApiValue(hit: boolean) {
  const endpoint = hit ? "hit" : "get";
  const response = await fetch(`https://api.countapi.xyz/${endpoint}/${COUNT_API_NAMESPACE}/${COUNT_API_KEY}`, {
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`CountAPI responded with ${response.status}`);
  }

  const data = (await response.json()) as { value?: number };
  return Math.max(0, data.value ?? 0);
}

export async function getViewCount() {
  if (hasKv()) {
    const value = await kv.get<number>(VIEW_KEY);
    return Math.max(0, value ?? 0);
  }

  return getCountApiValue(false);
}

export async function incrementViewCount() {
  if (hasKv()) {
    const value = await kv.incr(VIEW_KEY);
    return Math.max(0, Number(value));
  }

  return getCountApiValue(true);
}