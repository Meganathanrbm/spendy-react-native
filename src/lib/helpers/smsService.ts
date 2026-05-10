import { Platform, PermissionsAndroid, InteractionManager } from "react-native";
import { parseSMS, isBankSMS } from "./smsParser";
import { Account, SMSDraft, Transaction } from "../../types";

// Safe dynamic require — won't crash in Expo Go
let SmsAndroid: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("react-native-get-sms-android");
  SmsAndroid = mod.default ?? mod;
} catch (_) {
  // Not available (Expo Go or iOS)
}

export async function requestSMSPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: "Read SMS Permission",
        message:
          "Spendy needs to read your bank SMS messages to automatically detect transactions.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Deny",
        buttonPositive: "Allow",
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export type RawSMS = {
  _id: string;
  address: string;
  body: string;
  date: string;
  date_sent: string;
};

export function fetchBankSMS(daysBack = 30, maxCount = 500): Promise<RawSMS[]> {
  return new Promise((resolve, reject) => {
    if (!SmsAndroid) {
      reject(
        new Error(
          "SMS reading not available on this build.\n" +
            "Run 'npx expo prebuild' and build a native Android APK/AAB.",
        ),
      );
      return;
    }

    const minDate = Date.now() - daysBack * 24 * 60 * 60 * 1000;

    SmsAndroid.list(
      JSON.stringify({ box: "inbox", minDate, maxCount }),
      (fail: string) => reject(new Error(fail)),
      (_count: number, smsList: string) => {
        try {
          const messages: RawSMS[] = JSON.parse(smsList);
          resolve(Array.isArray(messages) ? messages : []);
        } catch {
          resolve([]);
        }
      },
    );
  });
}

const PARSE_CHUNK_SIZE = 50;

/**
 * Fetch, filter, and parse bank transaction SMS into SMSDraft objects.
 * Parsing is chunked with setImmediate yields so the JS thread doesn't
 * block the UI — touches and animations stay responsive during processing.
 */
export async function fetchParsedBankTransactions(
  daysBack = 30,
  existingTransactions: Transaction[] = [],
  accounts: Account[] = [],
): Promise<SMSDraft[]> {
  const raw = await fetchBankSMS(daysBack);

  // Yield to UI before starting heavy regex work
  await new Promise<void>((resolve) =>
    InteractionManager.runAfterInteractions(() => resolve()),
  );

  const seenBodies = new Set<string>();
  const drafts: SMSDraft[] = [];

  for (let i = 0; i < raw.length; i += PARSE_CHUNK_SIZE) {
    const chunk = raw.slice(i, i + PARSE_CHUNK_SIZE);

    for (const msg of chunk) {
      const body = msg.body?.trim();
      if (!body) continue;
      if (seenBodies.has(body)) continue;
      seenBodies.add(body);

      if (!isBankSMS(msg.address, body)) continue;

      const parsed = parseSMS(
        body,
        msg.address,
        new Date(parseInt(msg.date, 10)).toISOString(),
      );
      if (parsed) drafts.push(parsed);
    }

    // Yield between chunks so touches/animations can process
    if (i + PARSE_CHUNK_SIZE < raw.length) {
      await new Promise<void>((resolve) => setImmediate(resolve));
    }
  }
  const filtered = drafts.filter((d) => {
    return !existingTransactions.some(
      (t) =>
        t.amount === d.parsedAmount &&
        t.type === d.parsedType &&
        t.date.slice(0, 10) === d.parsedDate.slice(0, 10),
    );
  });

  return filtered.sort(
    (a, b) =>
      new Date(b.parsedDate).getTime() - new Date(a.parsedDate).getTime(),
  );
}
