import type { MetadataRoute } from "next";
import { locales, type AppLocale } from "@/i18n/locales";
import { getBaseUrl, getSitemapPaths, localeAlternates, localePath } from "@/lib/seo/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const paths = getSitemapPaths();

  return paths.flatMap((path) =>
    locales.map((locale) => {
      const asLocale = locale as AppLocale;
      return {
        url: `${baseUrl}${localePath(asLocale, path)}`,
        alternates: {
          languages: localeAlternates(path)
        }
      };
    })
  );
}
