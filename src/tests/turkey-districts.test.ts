import { describe, it, expect } from "vitest";
import { TURKEY_PROVINCES, TURKEY_DISTRICTS } from "@/data/turkey-provinces";

const ASCII_SLUG_RE = /^[a-z0-9-]+$/;

describe("TURKEY_PROVINCES completeness", () => {
  it("has exactly 81 provinces", () => {
    expect(TURKEY_PROVINCES).toHaveLength(81);
  });
});

describe("TURKEY_DISTRICTS coverage", () => {
  it("every province has at least 1 district", () => {
    const missing: string[] = [];
    for (const province of TURKEY_PROVINCES) {
      const districts = TURKEY_DISTRICTS[province.slug];
      if (!districts || districts.length === 0) {
        missing.push(province.slug);
      }
    }
    expect(missing).toEqual([]);
  });

  it("all 81 provinces are represented in TURKEY_DISTRICTS", () => {
    const districtKeys = Object.keys(TURKEY_DISTRICTS);
    for (const province of TURKEY_PROVINCES) {
      expect(districtKeys).toContain(province.slug);
    }
  });
});

describe("TURKEY_DISTRICTS slug integrity", () => {
  it("all district slugs are ASCII-only (no Turkish characters)", () => {
    const violations: string[] = [];
    for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
      for (const district of districts) {
        if (!ASCII_SLUG_RE.test(district.slug)) {
          violations.push(`${provinceSlug}/${district.name} → "${district.slug}"`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("no duplicate district slugs within any single province", () => {
    const duplicates: string[] = [];
    for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
      const seen = new Set<string>();
      for (const district of districts) {
        if (seen.has(district.slug)) {
          duplicates.push(`${provinceSlug}: duplicate slug "${district.slug}"`);
        }
        seen.add(district.slug);
      }
    }
    expect(duplicates).toEqual([]);
  });
});

describe("TURKEY_DISTRICTS display name integrity", () => {
  it("no district display name is empty", () => {
    const empty: string[] = [];
    for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
      for (const district of districts) {
        if (!district.name || district.name.trim().length === 0) {
          empty.push(`${provinceSlug} has empty district name`);
        }
      }
    }
    expect(empty).toEqual([]);
  });

  it("no district display name contains encoding corruption markers", () => {
    const corrupted: string[] = [];
    for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
      for (const district of districts) {
        if (district.name.includes("?") || district.name.includes("�")) {
          corrupted.push(`${provinceSlug}/${district.slug}: "${district.name}"`);
        }
      }
    }
    expect(corrupted).toEqual([]);
  });
});

describe("TURKEY_DISTRICTS spot checks", () => {
  it("istanbul has 39 districts", () => {
    expect(TURKEY_DISTRICTS.istanbul).toHaveLength(39);
  });

  it("ankara has 25 districts", () => {
    expect(TURKEY_DISTRICTS.ankara).toHaveLength(25);
  });

  it("ankara contains all original and new districts", () => {
    const slugs = TURKEY_DISTRICTS.ankara.map((d) => d.slug);
    // original
    expect(slugs).toContain("cankaya");
    expect(slugs).toContain("kecioren");
    expect(slugs).toContain("yenimahalle");
    // newly added
    expect(slugs).toContain("akyurt");
    expect(slugs).toContain("ayas");
    expect(slugs).toContain("bala");
    expect(slugs).toContain("beypazari");
    expect(slugs).toContain("camlidere");
    expect(slugs).toContain("cubuk");
    expect(slugs).toContain("elmadag");
    expect(slugs).toContain("evren");
    expect(slugs).toContain("golbasi");
    expect(slugs).toContain("gudul");
    expect(slugs).toContain("haymana");
    expect(slugs).toContain("kahramankazan");
    expect(slugs).toContain("kalecik");
    expect(slugs).toContain("kizilcahamam");
    expect(slugs).toContain("nallihan");
    expect(slugs).toContain("polatli");
    expect(slugs).toContain("sereflikochisar");
  });

  it("izmir has 30 districts", () => {
    expect(TURKEY_DISTRICTS.izmir).toHaveLength(30);
  });

  it("izmir contains all original and new districts", () => {
    const slugs = TURKEY_DISTRICTS.izmir.map((d) => d.slug);
    // original
    expect(slugs).toContain("bornova");
    expect(slugs).toContain("konak");
    expect(slugs).toContain("karsiyaka");
    // newly added
    expect(slugs).toContain("aliaga");
    expect(slugs).toContain("balcova");
    expect(slugs).toContain("bayindir");
    expect(slugs).toContain("bayrakli");
    expect(slugs).toContain("bergama");
    expect(slugs).toContain("beydag");
    expect(slugs).toContain("cesme");
    expect(slugs).toContain("dikili");
    expect(slugs).toContain("foca");
    expect(slugs).toContain("guzelbahce");
    expect(slugs).toContain("karaburun");
    expect(slugs).toContain("kemalpasa");
    expect(slugs).toContain("kinik");
    expect(slugs).toContain("kiraz");
    expect(slugs).toContain("menderes");
    expect(slugs).toContain("narlidere");
    expect(slugs).toContain("odemis");
    expect(slugs).toContain("seferihisar");
    expect(slugs).toContain("selcuk");
    expect(slugs).toContain("tire");
    expect(slugs).toContain("urla");
  });

  it("bursa has 18 districts and retains gorukle", () => {
    expect(TURKEY_DISTRICTS.bursa).toHaveLength(18);
    const slugs = TURKEY_DISTRICTS.bursa.map((d) => d.slug);
    expect(slugs).toContain("gorukle");
    expect(slugs).toContain("nilufer");
    expect(slugs).toContain("osmangazi");
    expect(slugs).toContain("yildirim");
    expect(slugs).toContain("gemlik");
    expect(slugs).toContain("inegol");
    expect(slugs).toContain("iznik");
    expect(slugs).toContain("mudanya");
    expect(slugs).toContain("mustafakemalpasa");
    expect(slugs).toContain("yenisehir");
  });

  it("antalya has 19 districts", () => {
    expect(TURKEY_DISTRICTS.antalya).toHaveLength(19);
    const slugs = TURKEY_DISTRICTS.antalya.map((d) => d.slug);
    expect(slugs).toContain("alanya");
    expect(slugs).toContain("manavgat");
    expect(slugs).toContain("serik");
    expect(slugs).toContain("kas");
    expect(slugs).toContain("kemer");
  });

  it("mersin has 13 districts", () => {
    expect(TURKEY_DISTRICTS.mersin).toHaveLength(13);
    const slugs = TURKEY_DISTRICTS.mersin.map((d) => d.slug);
    expect(slugs).toContain("tarsus");
    expect(slugs).toContain("silifke");
    expect(slugs).toContain("erdemli");
    expect(slugs).toContain("anamur");
  });

  it("adana has 15 districts including Seyhan and Ceyhan", () => {
    const districts = TURKEY_DISTRICTS.adana;
    expect(districts).toHaveLength(15);
    const slugs = districts.map((d) => d.slug);
    expect(slugs).toContain("seyhan");
    expect(slugs).toContain("ceyhan");
  });

  it("duzce has the expected 8 districts", () => {
    expect(TURKEY_DISTRICTS.duzce).toHaveLength(8);
  });

  it("bayburt has 3 districts", () => {
    expect(TURKEY_DISTRICTS.bayburt).toHaveLength(3);
  });

  it("hatay contains Antakya and Iskenderun", () => {
    const slugs = TURKEY_DISTRICTS.hatay.map((d) => d.slug);
    expect(slugs).toContain("antakya");
    expect(slugs).toContain("iskenderun");
  });

  it("mugla contains Bodrum, Fethiye, Marmaris", () => {
    const slugs = TURKEY_DISTRICTS.mugla.map((d) => d.slug);
    expect(slugs).toContain("bodrum");
    expect(slugs).toContain("fethiye");
    expect(slugs).toContain("marmaris");
  });

  it("sanliurfa contains Halfeti and Harran", () => {
    const slugs = TURKEY_DISTRICTS.sanliurfa.map((d) => d.slug);
    expect(slugs).toContain("halfeti");
    expect(slugs).toContain("harran");
  });

  it("kocaeli has exactly 12 districts", () => {
    expect(TURKEY_DISTRICTS.kocaeli).toHaveLength(12);
  });

  it("kocaeli contains all required districts", () => {
    const slugs = TURKEY_DISTRICTS.kocaeli.map((d) => d.slug);
    expect(slugs).toContain("basiskele");
    expect(slugs).toContain("cayirova");
    expect(slugs).toContain("darica");
    expect(slugs).toContain("derince");
    expect(slugs).toContain("dilovasi");
    expect(slugs).toContain("gebze");
    expect(slugs).toContain("golcuk");
    expect(slugs).toContain("izmit");
    expect(slugs).toContain("kandira");
    expect(slugs).toContain("karamursel");
    expect(slugs).toContain("kartepe");
    expect(slugs).toContain("korfez");
  });

  it("kocaeli district names are readable", () => {
    const names = TURKEY_DISTRICTS.kocaeli.map((d) => d.name);
    expect(names).toContain("Dilovası");
    expect(names).toContain("Çayırova");
    expect(names).toContain("Karamürsel");
    expect(names).toContain("Başiskele");
  });

  it("sakarya has 17 districts including Karasu", () => {
    expect(TURKEY_DISTRICTS.sakarya).toHaveLength(17);
    const slugs = TURKEY_DISTRICTS.sakarya.map((d) => d.slug);
    expect(slugs).toContain("karasu");
  });

  it("rize has 12 districts including Derepazarı", () => {
    expect(TURKEY_DISTRICTS.rize).toHaveLength(12);
    const slugs = TURKEY_DISTRICTS.rize.map((d) => d.slug);
    expect(slugs).toContain("derepazari");
  });

  it("trabzon has 18 districts including Dernekpazarı", () => {
    expect(TURKEY_DISTRICTS.trabzon).toHaveLength(18);
    const slugs = TURKEY_DISTRICTS.trabzon.map((d) => d.slug);
    expect(slugs).toContain("dernekpazari");
  });

  it("hakkari has 5 districts including Derecik", () => {
    expect(TURKEY_DISTRICTS.hakkari).toHaveLength(5);
    const slugs = TURKEY_DISTRICTS.hakkari.map((d) => d.slug);
    expect(slugs).toContain("derecik");
  });

  it("aksaray has 8 districts including Sultanhani", () => {
    expect(TURKEY_DISTRICTS.aksaray).toHaveLength(8);
    const slugs = TURKEY_DISTRICTS.aksaray.map((d) => d.slug);
    expect(slugs).toContain("sultanhani");
  });
});

describe("TURKEY_DISTRICTS slug fixes", () => {
  it("nevsehir Hacıbektaş uses correct slug hacibektas (not hacibiktas)", () => {
    const districts = TURKEY_DISTRICTS.nevsehir;
    const hacibiktas = districts.find((d) => d.slug === "hacibiktas");
    const hacibektas = districts.find((d) => d.slug === "hacibektas");
    expect(hacibiktas).toBeUndefined();
    expect(hacibektas).toBeDefined();
    expect(hacibektas?.name).toBe("Hacıbektaş");
  });

  it("sivas Akıncılar uses correct slug akincilar (not akincolar)", () => {
    const districts = TURKEY_DISTRICTS.sivas;
    const akincolar = districts.find((d) => d.slug === "akincolar");
    const akincilar = districts.find((d) => d.slug === "akincilar");
    expect(akincolar).toBeUndefined();
    expect(akincilar).toBeDefined();
    expect(akincilar?.name).toBe("Akıncılar");
  });
});
