import type { CalendarProvider } from "./calendar-provider.interface";
import { FakeCalendarProvider } from "./fake-calendar.provider";
import { GoogleCalendarProvider } from "./google-calendar.provider";
import { assertProductionProvider } from "@/lib/providers/provider-health";

let _provider: CalendarProvider | null = null;

export function getCalendarProvider(): CalendarProvider {
  if (_provider) return _provider;

  const providerName = process.env.CALENDAR_PROVIDER ?? "FAKE";

  assertProductionProvider({
    envVarName: "CALENDAR_PROVIDER",
    currentValue: providerName,
    fakeValues: ["FAKE"],
    providerLabel: "Calendar",
  });

  if (providerName === "GOOGLE") {
    _provider = new GoogleCalendarProvider();
  } else {
    _provider = new FakeCalendarProvider();
  }

  return _provider;
}

export function resetCalendarProvider() {
  _provider = null;
}
