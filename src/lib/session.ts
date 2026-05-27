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

export async function signSession(role: string): Promise<string> {
  const secret = getSecret();
  const key = await getCryptoKey(secret);
  const data = encoder.encode(role);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `${role}:${signatureHex}`;
}

export async function verifySession(token: string): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(":");
  if (parts.length !== 2) return null;
  const [role, signatureHex] = parts;
  
  try {
    const secret = getSecret();
    const key = await getCryptoKey(secret);
    
    // Convert hex back to buffer
    const match = signatureHex.match(/.{1,2}/g);
    if (!match) return null;
    const signatureBytes = new Uint8Array(match.map(byte => parseInt(byte, 16)));
    
    const data = encoder.encode(role);
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, data);
    return isValid ? role : null;
  } catch (e) {
    console.error("Failed to verify session token:", e);
    return null;
  }
}
