import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type { MobileAuthPayload } from "../api/client";

const SESSION_KEY = "slotpilot_mobile_session_v2";

export type MobileSession = MobileAuthPayload & {
  expiresAt: number;
};

export function toSession(payload: MobileAuthPayload): MobileSession {
  return {
    ...payload,
    expiresAt: Date.now() + payload.expiresIn * 1000,
  };
}

async function secureStoreAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function loadSession(): Promise<MobileSession | null> {
  try {
    const secureAvailable = await secureStoreAvailable();
    const raw = secureAvailable
      ? await SecureStore.getItemAsync(SESSION_KEY)
      : await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MobileSession;
    if (!parsed?.accessToken || !parsed?.refreshToken || !parsed?.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveSession(session: MobileSession) {
  const serialized = JSON.stringify(session);
  const secureAvailable = await secureStoreAvailable();
  if (secureAvailable) {
    await SecureStore.setItemAsync(SESSION_KEY, serialized);
    return;
  }
  await AsyncStorage.setItem(SESSION_KEY, serialized);
}

export async function clearSession() {
  const secureAvailable = await secureStoreAvailable();
  if (secureAvailable) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return;
  }
  await AsyncStorage.removeItem(SESSION_KEY);
}
