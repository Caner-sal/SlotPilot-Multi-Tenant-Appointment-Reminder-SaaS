# Türkiye District Audit — SlotPilot

> Generated template based on the current state of `src/data/turkey-provinces.ts`.
> Re-run `npm run audit:districts` at any time for a live report.

## How to Run

```bash
npm run audit:districts
# or directly:
npx tsx scripts/audit-turkey-districts.ts
```

---

## Audit Structure

The script performs 9 checks in order:

| # | Check | What It Verifies |
|---|-------|-----------------|
| 1 | Province Count | Exactly 81 provinces present |
| 2 | Province Slug Uniqueness | No two provinces share a slug |
| 3 | Province Name & Slug Validation | Slugs are ASCII-only; names have no encoding corruption |
| 4 | Provinces WITH District Data | Lists covered provinces and district counts |
| 5 | Provinces WITHOUT District Data | Lists missing provinces (DS-2 backlog) |
| 6 | District Slug Uniqueness (per province) | No duplicate slugs within a single province |
| 7 | District Slug Uniqueness (global) | Flags slugs reused across provinces (warns, not fails) |
| 8 | District Name & Slug Validation | Slugs ASCII-only; names preserve Turkish characters |
| 9 | Summary | PASS / FAIL / PASS (with warnings) overall status |

**Exit code:** `0` when province count equals 81 (even with missing districts); `1` when province count is wrong.

---

## Current State (as of initial DS-1 implementation)

### Province Count

- **Total:** 81 / 81 — PASS

### Provinces WITH District Data (7 of 81)

| Plate | Slug | Name | Districts |
|------:|------|------|----------:|
| 34 | `istanbul` | İstanbul | 39 |
| 06 | `ankara` | Ankara | 8 |
| 35 | `izmir` | İzmir | 9 |
| 16 | `bursa` | Bursa | 4 |
| 07 | `antalya` | Antalya | 5 |
| 41 | `kocaeli` | Kocaeli | 4 |
| 33 | `mersin` | Mersin | 4 |

**Total districts across all covered provinces:** 73

### Provinces WITHOUT District Data (74 of 81) — DS-2 Backlog

The following 74 provinces have no district data yet and must be populated in ticket **DS-2**:

| Plate | Slug | Name | Region |
|------:|------|------|--------|
| 01 | `adana` | Adana | Akdeniz |
| 02 | `adiyaman` | Adıyaman | Güneydoğu Anadolu |
| 03 | `afyonkarahisar` | Afyonkarahisar | Ege |
| 04 | `agri` | Ağrı | Doğu Anadolu |
| 05 | `amasya` | Amasya | Karadeniz |
| 08 | `artvin` | Artvin | Karadeniz |
| 09 | `aydin` | Aydın | Ege |
| 10 | `balikesir` | Balıkesir | Marmara |
| 11 | `bilecik` | Bilecik | Marmara |
| 12 | `bingol` | Bingöl | Doğu Anadolu |
| 13 | `bitlis` | Bitlis | Doğu Anadolu |
| 14 | `bolu` | Bolu | Karadeniz |
| 15 | `burdur` | Burdur | Akdeniz |
| 17 | `canakkale` | Çanakkale | Marmara |
| 18 | `cankiri` | Çankırı | İç Anadolu |
| 19 | `corum` | Çorum | Karadeniz |
| 20 | `denizli` | Denizli | Ege |
| 21 | `diyarbakir` | Diyarbakır | Güneydoğu Anadolu |
| 22 | `edirne` | Edirne | Marmara |
| 23 | `elazig` | Elazığ | Doğu Anadolu |
| 24 | `erzincan` | Erzincan | Doğu Anadolu |
| 25 | `erzurum` | Erzurum | Doğu Anadolu |
| 26 | `eskisehir` | Eskişehir | İç Anadolu |
| 27 | `gaziantep` | Gaziantep | Güneydoğu Anadolu |
| 28 | `giresun` | Giresun | Karadeniz |
| 29 | `gumushane` | Gümüşhane | Karadeniz |
| 30 | `hakkari` | Hakkari | Doğu Anadolu |
| 31 | `hatay` | Hatay | Akdeniz |
| 32 | `isparta` | Isparta | Akdeniz |
| 36 | `kars` | Kars | Doğu Anadolu |
| 37 | `kastamonu` | Kastamonu | Karadeniz |
| 38 | `kayseri` | Kayseri | İç Anadolu |
| 39 | `kirklareli` | Kırklareli | Marmara |
| 40 | `kirsehir` | Kırşehir | İç Anadolu |
| 42 | `konya` | Konya | İç Anadolu |
| 43 | `kutahya` | Kütahya | Ege |
| 44 | `malatya` | Malatya | Doğu Anadolu |
| 45 | `manisa` | Manisa | Ege |
| 46 | `kahramanmaras` | Kahramanmaraş | Akdeniz |
| 47 | `mardin` | Mardin | Güneydoğu Anadolu |
| 48 | `mugla` | Muğla | Ege |
| 49 | `mus` | Muş | Doğu Anadolu |
| 50 | `nevsehir` | Nevşehir | İç Anadolu |
| 51 | `nigde` | Niğde | İç Anadolu |
| 52 | `ordu` | Ordu | Karadeniz |
| 53 | `rize` | Rize | Karadeniz |
| 54 | `sakarya` | Sakarya | Marmara |
| 55 | `samsun` | Samsun | Karadeniz |
| 56 | `siirt` | Siirt | Güneydoğu Anadolu |
| 57 | `sinop` | Sinop | Karadeniz |
| 58 | `sivas` | Sivas | İç Anadolu |
| 59 | `tekirdag` | Tekirdağ | Marmara |
| 60 | `tokat` | Tokat | Karadeniz |
| 61 | `trabzon` | Trabzon | Karadeniz |
| 62 | `tunceli` | Tunceli | Doğu Anadolu |
| 63 | `sanliurfa` | Şanlıurfa | Güneydoğu Anadolu |
| 64 | `usak` | Uşak | Ege |
| 65 | `van` | Van | Doğu Anadolu |
| 66 | `yozgat` | Yozgat | İç Anadolu |
| 67 | `zonguldak` | Zonguldak | Karadeniz |
| 68 | `aksaray` | Aksaray | İç Anadolu |
| 69 | `bayburt` | Bayburt | Karadeniz |
| 70 | `karaman` | Karaman | İç Anadolu |
| 71 | `kirikkale` | Kırıkkale | İç Anadolu |
| 72 | `batman` | Batman | Güneydoğu Anadolu |
| 73 | `sirnak` | Şırnak | Güneydoğu Anadolu |
| 74 | `bartin` | Bartın | Karadeniz |
| 75 | `ardahan` | Ardahan | Doğu Anadolu |
| 76 | `igdir` | Iğdır | Doğu Anadolu |
| 77 | `yalova` | Yalova | Marmara |
| 78 | `karabuk` | Karabük | Karadeniz |
| 79 | `kilis` | Kilis | Güneydoğu Anadolu |
| 80 | `osmaniye` | Osmaniye | Akdeniz |
| 81 | `duzce` | Düzce | Karadeniz |

### Integrity Checks

| Check | Status | Notes |
|-------|--------|-------|
| Province slug uniqueness | PASS | All 81 slugs are unique |
| Province slugs are ASCII-only | PASS | Turkish chars correctly romanised in slugs |
| Province names well-formed | PASS | All names display Turkish characters correctly |
| District slugs unique per province | PASS | No intra-province duplicates |
| District slugs globally unique | PASS | No cross-province slug collisions |
| District slugs are ASCII-only | PASS | Turkish chars correctly romanised in slugs |
| District names well-formed | PASS | Turkish characters (ç, ğ, ı, ö, ş, ü) preserved |

### Overall Status

```
PASS (with warnings)
Province count is correct. 74 province(s) lack district data — add them in DS-2.
```

---

## DS-2 Work Items

To complete full district coverage, add a `Record<string, District[]>` entry for each of the 74
provinces listed above in `src/data/turkey-provinces.ts`, following the existing pattern:

```typescript
// Example pattern (Adana has 15 districts)
adana: [
  { name: "Aladağ",    slug: "aladag" },
  { name: "Ceyhan",    slug: "ceyhan" },
  { name: "Çukurova",  slug: "cukurova" },
  // ... remaining districts
],
```

**Rules:**
- `name` must use correct Turkish characters (ç, ğ, ı, ö, ş, ü).
- `slug` must be all-lowercase ASCII with hyphens only — no Turkish characters, no spaces.
- After adding districts, re-run `npm run audit:districts` to verify zero failures.

---

## Change History

| Date | Action | Author |
|------|--------|--------|
| 2026-05-09 | Initial audit template created; 7 provinces covered (DS-1) | DS team |
