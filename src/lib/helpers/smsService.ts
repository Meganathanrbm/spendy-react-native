import { Platform, PermissionsAndroid } from "react-native";
import { parseSMS, isBankSMS } from "./smsParser";
import { SMSDraft } from "../../types";

// Safe dynamic require — won't crash in Expo Go
let SmsAndroid: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SmsAndroid = require("react-native-get-sms-android").default;
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
      }
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export type RawSMS = {
  _id: string;
  address: string;  // sender
  body: string;
  date: string;     // ms timestamp
  date_sent: string;
};

// Fetch last `maxCount` bank SMS messages from the last `daysBack` days
export function fetchBankSMS(
  daysBack = 30,
  maxCount = 200
): Promise<RawSMS[]> {
  return new Promise((resolve, reject) => {
    if (!SmsAndroid) {
      reject(new Error("SMS reading not available. Run 'npx expo prebuild' and build for Android."));
      return;
    }
    const minDate = Date.now() - daysBack * 24 * 60 * 60 * 1000;
    SmsAndroid.list(
      JSON.stringify({
        box: "inbox",
        minDate,
        maxCount,
      }),
      (fail: string) => reject(new Error(fail)),
      (_count: number, smsList: string) => {
        try {
          const messages: RawSMS[] = JSON.parse(smsList);
          resolve(messages);
        } catch {
          resolve([]);
        }
      }
    );
  });
}

export async function fetchParsedBankTransactions(
  daysBack = 30
): Promise<SMSDraft[]> {
  const raw = await fetchBankSMS(daysBack);
  const drafts: SMSDraft[] = [];
  for (const msg of raw) {
    if (!isBankSMS(msg.address, msg.body)) continue;
    const parsed = parseSMS(
      msg.body,
      msg.address,
      new Date(parseInt(msg.date, 10)).toISOString()
    );
    if (parsed) drafts.push(parsed);
  }
  // Most recent first
  return drafts.sort(
    (a, b) => new Date(b.parsedDate).getTime() - new Date(a.parsedDate).getTime()
  );
}
