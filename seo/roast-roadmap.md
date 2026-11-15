# SEO Roast Roadmap: chesleybrown.ca (2026-11-15)

Verdict: Mistyped URLs return the homepage with status 200, and the one page that should sell Scuttle never says "boat sinking game."

Money page: `https://chesleybrown.ca/scuttle/`. Conversion: an App Store tap to `https://apps.apple.com/us/app/scuttle-boat-sandbox/id6814644019`.

Paid tools (Ahrefs, DataForSEO, AI SEO Tracker) were not available. SERP notes below are from public web search on 2026-11-15. No referring-domain counts are invented.

| # | Tier | Issue | Revenue impact | Fix | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | FATAL | Unknown paths (`/no-such-page-xyz`, `/scuttle/privacy`, `/SCUTTLE/`) return the homepage with HTTP 200 | Every typo URL is a second copy of the homepage Google can index, which dilutes the domain and can outrank `/scuttle/` | `vercel.json` redirects the real duplicates, then serves `404.html` with status 404 when no file matches | agent | shipped in PR |
| 2 | REVENUE | Title, H1, and description never said boat sinking game. Public search labeled `https://chesleybrown.ca/scuttle/` "Scuttle Support" | The click for the queries that match the game goes to App Store listings and Titanic sims whose titles say the query | Title, H1, and description rewritten. Direct answer under "What is Scuttle?" | agent | shipped in PR |
| 3 | REVENUE | JSON-LD was VideoGame only. No SoftwareApplication offer, no FAQ, offer URL was the id-only App Store link that 301s | App rich results and answer engines miss the $1.99 price, the trailer, and the real support answers | VideoGame + SoftwareApplication + MobileApplication, Offer 1.99 USD, sameAs the App Store URL, VideoObject, FAQPage. No AggregateRating | agent | shipped in PR |
| 4 | REVENUE | `/`, `/index.html`, `/scuttle`, and `/scuttle/index.html` all returned 200 | Duplicate URLs split what little authority the money page has | 308 to the canonical URL. Canonicals were already correct | agent | shipped in PR |
| 5 | REVENUE | Copy said "over fifty" and never named the Titanic, Arcade, 8 leaderboards, or 2-4 player play | The page cannot be quoted for the searches people actually type, and it disagrees with the game | Grounded copy on `/scuttle/` only. App Store buttons point at the product URL | agent | shipped in PR |
| 6 | COMPOUNDING | Homepage still says "over 50" and "50+ boats". The App Store blurb still says "over 50 boats" and does not say 54 or name the Titanic | Google and answer engines will quote one number and then trust neither | Update the App Store description and the homepage Scuttle stat to 54 hulls, including the Titanic. Other project cards were left alone in this PR | founder | next |
| 7 | COMPOUNDING | Two contextual body links point at `/scuttle/`: the homepage card ("See the game") and the privacy page. No posts | The money page has almost no internal support, so one card is the whole site's vote | One short build note (cell hulls, or lockstep) with a body link to `/scuttle/`. Do not add another link inside the existing card | founder | next |
| 8 | COMPOUNDING | "titanic sinking game iPhone" is It's Titanic, Titanic Sinking Simulator, and Titanic Premium. Scuttle was absent. Those are historical sinking sims | That query sends the install to a different paid game | The page now names the Titanic as one of 54 hulls in a sandbox, which is the honest match. Next is a screenshot or a short post that says sandbox, not a 1912 replay, so the intent stays accurate | founder | next |
| 9 | COMPOUNDING | No clean referring-domain count. Public results for these queries are App Store URLs, plus Fleetfall and Things In Motion, which have their own landing pages | A DR number would not change the fact that the pages ranking outside the App Store are the ones with a site | When a backlink tool is available, count dofollow in-content links, one per domain. Do not buy sitewide badges | founder | next |
| 10 | COMPOUNDING | Playing Scuttle never creates a link. There is no public replay, share URL, or embed | Water Box earns links from a workshop. Scuttle does not | A public replay page is product work. If it ships, the link back uses the brand "Scuttle", not a keyword anchor | founder | later |

## What already passed

- `robots.txt` is default-allow, with a Sitemap line. It does not block Bing or AI crawlers, and it does not disallow CSS or JS. Left unchanged.
- One locale, English. No hreflang.
- No adult or user-uploaded media. SafeSearch on vs off was not available in public search. Nothing in the HTML looks like a SafeSearch demotion.
- No programmatic routes, no `?q=` or `?page=` index bloat.
- `$1.99` is in the HTML body, including for GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Bingbot, and Googlebot. It is not a JS-only price.
- `https://chesleybrown.ca/`, `/scuttle/`, and `/scuttle/privacy.html` are indexed. Canonicals point at those URLs. `www` 307s to the apex. `http` 308s to `https`.
- Desktop keeps an App Store badge in the sticky header. The page shows the trailer, shots, price, and FAQ without an account.
- Three App Store ratings. AggregateRating was not added.

## Title decision for `/scuttle/`

Primary query: "boat sinking game iPhone". Public search for that query returned App Store pages, including Scuttle's own listing, plus Fluid Ship Simulator, Water Box, Fleetfall, and Sink Them. "ship sinking simulator iOS" was the same cluster plus Titanic Sinking Simulator. "physics sandbox game iOS" was a different cluster (Physics Box, Melon Sandbox, Things In Motion) and is a weaker fit, so it stays in the description and the body, not the title.

| Option | Title | Why it lost or won |
|---|---|---|
| 1, shipped | Boat Sinking Game for iPhone and iPad: Scuttle (48) | Query first, both devices, brand kept, under 55 characters |
| 2 | Boat Sinking Game for iPhone: Scuttle (39) | Tighter, but the game is also for iPad |
| 3 | Scuttle: Boat Sinking Game for iPhone (38) | Brand first. The App Store listing already owns the brand query |
| 4 | Ship Sinking Simulator for iPhone: Scuttle (43) | "Simulator" is the Titanic-replay SERP, and Scuttle is a sandbox |
| 5 | Scuttle: Physics Sandbox Game for iPhone (41) | Misses the sinking intent those SERPs actually show |

Homepage title stays `Chesley Brown · Senior Software Engineer and iOS App Maker`. That is the title public search already shows for `/`, and the page is a portfolio. Putting boat-sinking queries in it would mismatch the page.

H1 text is `Scuttle` plus `Boat sinking game for iPhone`. The URL stays `/scuttle/`.

## Fluff (ignore until the rows above ship)

- Shot alt text is already written as sentences. One caption now says "The Titanic" because that file is the Titanic hull.
- Privacy title "Scuttle Privacy Policy" is fine. That page was not rewritten.
- Trailer thumbnail is webp. Google can fetch it.
- The hero pixel line ("iPhone and iPad · $1.99 · no ads") stays. It is the existing label, and the definition under "What is Scuttle?" still finishes inside the first 40 words.
- Do not add star ratings until there are more than the current 3.
