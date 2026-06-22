const encoder = new TextEncoder();

const DEFAULT_SECRET = "innoversity_fallback_super_secret_session_key_123456";

function getSecret(): string {
  return process.env.SESSION_SECRET || DEFAULT_SECRET;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function signSession(user: SessionUser): Promise<string> {
  const secret = getSecret();
  const key = await getCryptoKey(secret);
  const jsonStr = JSON.stringify(user);
  const data = encoder.encode(jsonStr);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, "0")).join("");
  // base64 encode the jsonStr to make it safe for cookie splitting/parsing
  const payloadB64 = btoa(unescape(encodeURIComponent(jsonStr)));
  return `${payloadB64}:${signatureHex}`;
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  if (!token) return null;
  const parts = token.split(":");
  if (parts.length !== 2) return null;
  const [payloadB64, signatureHex] = parts;
  
  try {
    const secret = getSecret();
    const key = await getCryptoKey(secret);
    
    // Decode base64 payload
    const jsonStr = decodeURIComponent(escape(atob(payloadB64)));
    
    // Convert hex back to buffer
    const match = signatureHex.match(/.{1,2}/g);
    if (!match) return null;
    const signatureBytes = new Uint8Array(match.map(byte => parseInt(byte, 16)));
    
    const data = encoder.encode(jsonStr);
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, data);
    return isValid ? JSON.parse(jsonStr) as SessionUser : null;
  } catch (e) {
    console.error("Failed to verify session token:", e);
    return null;
  }
}
