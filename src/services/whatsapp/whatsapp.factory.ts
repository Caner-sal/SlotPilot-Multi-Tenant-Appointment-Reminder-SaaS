import type { WhatsAppProvider } from "./whatsapp-provider.interface";
import { FakeWhatsAppProvider } from "./fake-whatsapp.provider";
import { MetaWhatsAppProvider } from "./meta-whatsapp.provider";

let _provider: WhatsAppProvider | null = null;

export function getWhatsAppProvider(): WhatsAppProvider {
  if (_provider) return _provider;

  const providerName = process.env.WHATSAPP_PROVIDER ?? "FAKE";

  if (providerName === "META") {
    _provider = new MetaWhatsAppProvider();
  } else {
    _provider = new FakeWhatsAppProvider();
  }

  return _provider;
}

export function resetWhatsAppProvider() {
  _provider = null;
}
