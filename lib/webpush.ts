import { createECDH, createCipheriv, createPrivateKey, hkdfSync, randomBytes, sign } from "crypto";

// Minimal Web Push sender (RFC 8291 aes128gcm + RFC 8292 VAPID) using only Node's crypto.
export type PushSub = { endpoint: string; p256dh: string; auth: string };
export type PushMessage = { title: string; body: string; tag?: string; url?: string };

const b64u = (b: Buffer) => b.toString("base64url");
const unb64u = (s: string) => Buffer.from(s, "base64url");

function vapidJwt(audience: string): string {
  const pub = unb64u(process.env.VAPID_PUBLIC_KEY || "");
  const key = createPrivateKey({
    format: "jwk",
    key: { kty: "EC", crv: "P-256", x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)), d: process.env.VAPID_PRIVATE_KEY || "" },
  });
  const header = b64u(Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64u(Buffer.from(JSON.stringify({ aud: audience, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: process.env.VAPID_SUBJECT })));
  const data = `${header}.${payload}`;
  const sig = sign("sha256", Buffer.from(data), { key, dsaEncoding: "ieee-p1363" });
  return `${data}.${b64u(sig)}`;
}

function encryptPayload(plain: Buffer, uaPublic: Buffer, authSecret: Buffer): Buffer {
  const as = createECDH("prime256v1");
  as.generateKeys();
  const asPublic = as.getPublicKey();
  const ecdhSecret = as.computeSecret(uaPublic);
  const salt = randomBytes(16);
  const keyInfo = Buffer.concat([Buffer.from("WebPush: info\0"), uaPublic, asPublic]);
  const ikm = Buffer.from(hkdfSync("sha256", ecdhSecret, authSecret, keyInfo, 32));
  const cek = Buffer.from(hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: aes128gcm\0"), 16));
  const nonce = Buffer.from(hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: nonce\0"), 12));
  const cipher = createCipheriv("aes-128-gcm", cek, nonce);
  const ct = Buffer.concat([cipher.update(Buffer.concat([plain, Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);
  const rs = Buffer.alloc(4);
  rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([asPublic.length]), asPublic, ct]);
}

// Returns "ok", "gone" (subscription expired, delete it) or "fail".
export async function sendPush(sub: PushSub, msg: PushMessage): Promise<"ok" | "gone" | "fail"> {
  try {
    const body = encryptPayload(Buffer.from(JSON.stringify(msg)), unb64u(sub.p256dh), unb64u(sub.auth));
    const u = new URL(sub.endpoint);
    const jwt = vapidJwt(`${u.protocol}//${u.host}`);
    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        TTL: "43200",
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        Authorization: `vapid t=${jwt}, k=${process.env.VAPID_PUBLIC_KEY}`,
      },
      body: new Uint8Array(body),
    });
    if (res.status === 404 || res.status === 410) return "gone";
    return res.ok ? "ok" : "fail";
  } catch {
    return "fail";
  }
}
