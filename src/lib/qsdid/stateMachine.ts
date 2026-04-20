// src/lib/qsdid/stateMachine.ts
/**
 * Strict event-driven auth state machine.
 * No automatic progression — every transition needs an explicit event.
 */
import { useCallback, useMemo, useReducer } from "react";

export type AuthState =
  | "INIT"
  | "TOTP_SETUP"
  | "TOTP_VERIFIED"
  | "BACKEND_READY"
  | "CHALLENGE_GENERATED"
  | "KEYS_GENERATED"
  | "SIGNED"
  | "VERIFIED"
  | "WALLET_CONNECTED"
  | "AUTHENTICATED";

export type AuthEvent =
  | "TOTP_SETUP_STARTED"
  | "TOTP_VERIFIED"
  | "BACKEND_OK"
  | "CHALLENGE_GENERATED"
  | "KEYS_GENERATED"
  | "SIGNED"
  | "VERIFIED"
  | "WALLET_CONNECTED"
  | "ACCESS_GRANTED"
  | "RESET";

const transitions: Record<AuthState, Partial<Record<AuthEvent, AuthState>>> = {
  INIT: { TOTP_SETUP_STARTED: "TOTP_SETUP", TOTP_VERIFIED: "TOTP_VERIFIED", RESET: "INIT" },
  TOTP_SETUP: { TOTP_VERIFIED: "TOTP_VERIFIED", RESET: "INIT" },
  TOTP_VERIFIED: { BACKEND_OK: "BACKEND_READY", RESET: "INIT" },
  BACKEND_READY: { CHALLENGE_GENERATED: "CHALLENGE_GENERATED", KEYS_GENERATED: "KEYS_GENERATED", RESET: "INIT" },
  CHALLENGE_GENERATED: { KEYS_GENERATED: "KEYS_GENERATED", SIGNED: "SIGNED", RESET: "INIT" },
  KEYS_GENERATED: { CHALLENGE_GENERATED: "CHALLENGE_GENERATED", SIGNED: "SIGNED", RESET: "INIT" },
  SIGNED: { VERIFIED: "VERIFIED", RESET: "INIT" },
  VERIFIED: { WALLET_CONNECTED: "WALLET_CONNECTED", RESET: "INIT" },
  WALLET_CONNECTED: { ACCESS_GRANTED: "AUTHENTICATED", RESET: "INIT" },
  AUTHENTICATED: { RESET: "INIT" },
};

function reducer(state: AuthState, event: AuthEvent): AuthState {
  const next = transitions[state]?.[event];
  if (!next) {
    // eslint-disable-next-line no-console
    console.warn(`[STATE] Illegal transition ${state} → ${event} (ignored)`);
    return state;
  }
  return next;
}

export function useAuthMachine(initial: AuthState = "INIT") {
  const [state, dispatch] = useReducer(reducer, initial);
  const send = useCallback((evt: AuthEvent) => dispatch(evt), []);
  return useMemo(() => ({ state, send }), [state, send]);
}