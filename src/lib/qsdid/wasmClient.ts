// src/lib/qsdid/wasmClient.ts
/**
 * The ONLY interface to the QS-DID Rust backend.
 * All cryptography (ML-DSA-65 hybrid signing) goes through this WASM module.
 * Direct HTTP calls to the backend are forbidden.
 */
import { audit } from "./audit";

// Vite resolves this as a normal ES module import; the glue auto-fetches
// /wasm/qsdid_wasm_bg.wasm (patched in src/lib/wasm/qsdid_wasm.js).
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - hand-written wasm-bindgen glue, no .d.ts shipped
import init, * as qs from "@/lib/wasm/qsdid_wasm.js";

const DEFAULT_API_BASE = "http://localhost:8081";

let initPromise: Promise<void> | null = null;
let ready = false;
let backendReady = false;

export interface HybridKeyPair {
  /** Hybrid public key (classical + ML-DSA-65), backend-encoded */
  public_key: string;
  /** Hybrid private key — STAYS on this device. Never transmit. */
  private_key: string;
  // The Rust struct may also include algorithm metadata, key ids, etc.
  [k: string]: unknown;
}

export interface SignatureResult {
  signature_id: string;
  signature?: string;
  algorithm?: string;
  created_at?: string;
  [k: string]: unknown;
}

export interface VerificationResult {
  valid: boolean;
  signature_id?: string;
  [k: string]: unknown;
}

export interface HealthResult {
  status?: string;
  version?: string;
  [k: string]: unknown;
}

/** Initialize the WASM module exactly once and configure the backend URL. */
export function initWasm(apiBaseUrl: string = DEFAULT_API_BASE): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await init();
      qs.set_api_base_url(apiBaseUrl);
      ready = true;
      audit("INFO", "WASM initialized", { apiBaseUrl });
    } catch (e) {
      audit("ERROR", "WASM initialization failed", { error: String(e) });
      initPromise = null;
      throw e;
    }
  })();
  return initPromise;
}

function ensureReady() {
  if (!ready) throw new Error("WASM module not initialized. Call initWasm() first.");
}

/** Pings the Rust backend through WASM. Throws if unreachable. */
export async function healthCheck(): Promise<HealthResult> {
  ensureReady();
  try {
    const res = (await qs.health_check()) as HealthResult;
    backendReady = true;
    audit("SUCCESS", "Backend health check passed", { status: res?.status });
    return res;
  } catch (e) {
    backendReady = false;
    audit("ERROR", "Backend unreachable", { error: String(e) });
    throw new Error("Backend unavailable");
  }
}

export function isBackendReady() {
  return backendReady;
}

/** Generate a hybrid (classical + ML-DSA-65) keypair on the client. */
export async function generateHybridKeys(): Promise<HybridKeyPair> {
  ensureReady();
  audit("INFO", "Generating hybrid keys");
  const result = (await qs.generate_hybrid_keys()) as HybridKeyPair;
  audit("SUCCESS", "Keys generated", {
    publicKeyPreview: typeof result?.public_key === "string" ? result.public_key.slice(0, 24) + "…" : undefined,
  });
  return result;
}

/** Sign a base64-encoded document via real ML-DSA backend. */
export async function signDocument(documentB64: string): Promise<SignatureResult> {
  ensureReady();
  audit("INFO", "Signing requested");
  const res = (await qs.sign_document(documentB64)) as SignatureResult;
  audit("SUCCESS", "Signature created", { signature_id: res?.signature_id });
  return res;
}

/** Verify a signature against a base64-encoded document via real ML-DSA backend. */
export async function verifySignature(signatureId: string, documentB64: string): Promise<VerificationResult> {
  ensureReady();
  const res = (await qs.verify_signature(signatureId, documentB64)) as VerificationResult;
  if (res?.valid) audit("SUCCESS", "Verification passed", { signature_id: signatureId });
  else audit("ERROR", "Verification failed", { signature_id: signatureId, result: res });
  return res;
}

/** Encode a UTF-8 string as base64 (browser-safe). */
export function encodeUtf8ToB64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/** Cryptographically random base64url nonce. */
export function generateChallengeNonce(byteLen = 32): string {
  const buf = new Uint8Array(byteLen);
  crypto.getRandomValues(buf);
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}