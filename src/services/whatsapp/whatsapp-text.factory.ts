import type { WhatsAppTextProvider } from "./whatsapp-text-provider.interface";
import { FakeWhatsAppTextProvider } from "./fake-whatsapp-text.provider";
import { MetaWhatsAppTextProvider } from "./meta-whatsapp-text.provider";
import { TwilioWhatsAppTextProvider } from "./twilio-whatsapp-text.provider";

let _provider: WhatsAppTextProvider | null = null;

export function getWhatsAppTextProvider(): WhatsAppTextProvider {
  if (_provider) return _provider;

  const providerEnv = process.env.WHATSAPP_TEXT_PROVIDER ?? "FAKE";

  if (providerEnv === "META") {
    _provider = new MetaWhatsAppTextProvider();
  } else if (providerEnv === "TWILIO") {
    _provider = new TwilioWhatsAppTextProvider();
  } else {
    _provider = new FakeWhatsAppTextProvider();
  }

  return _provider;
}

export function resetWhatsAppTextProvider(): void {
  _provider = null;
}
