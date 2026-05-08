import type { SmsProvider } from "./sms-provider.interface";
import { FakeSmsProvider } from "./fake-sms.provider";
import { TwilioSmsProvider } from "./twilio-sms.provider";

let _provider: SmsProvider | null = null;

export function getSmsProvider(): SmsProvider {
  if (_provider) return _provider;

  const providerName = process.env.SMS_PROVIDER ?? "FAKE";

  if (providerName === "TWILIO") {
    _provider = new TwilioSmsProvider();
  } else {
    _provider = new FakeSmsProvider();
  }

  return _provider;
}

// For testing: reset the singleton
export function resetSmsProvider() {
  _provider = null;
}
