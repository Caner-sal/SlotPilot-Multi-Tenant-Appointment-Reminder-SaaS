import { describe, expect, it } from "vitest";
import ru from "@/messages/ru.json";
import nl from "@/messages/nl.json";

describe("extended language pack smoke", () => {
  it("renders Cyrillic characters in Russian pack", () => {
    expect(ru.common.language).toMatch(/[\u0400-\u04FF]/);
    expect(ru.nav.appointments).toMatch(/[\u0400-\u04FF]/);
  });

  it("keeps Dutch pack as LTR-oriented latin text", () => {
    expect(nl.nav.appointments).toBe("Afspraken");
    expect(nl.common.language).toBe("Taal");
  });
});
