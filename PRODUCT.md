# Product

<!-- impeccable:product-schema 1 -->

The brief for this file was the existing page plus Chesley's request. There was no separate interview. Facts below are taken from that brief and from the page already shipping at `web/scuttle/`. Anything marked **Inferred** was not confirmed in a live answer.

## Platform

web

## Users

Someone on a phone, often in Safari, deciding whether to get a $1.99 game. They need to see the game, the price, and that it is a one-time purchase with no ads. **Inferred** from the page's job and from the note that the layout is a phone-first store visit.

A player who already has Scuttle and needs a straight answer: sideways on purpose, how to speed it up, how to reset, why nearby or online play failed, where the licenses are. They email `me@chesleybrown.ca` when the FAQ is not enough.

## Product Purpose

Scuttle is a pixel-art boat-sinking physics sandbox for iPhone and iPad. This page is the public page for it: show the game, say what it is, link to the App Store, and answer support questions. Success is a visitor who understands the game and can tap through to the store, or a player who leaves with the right fix.

## Positioning

A $1.99 physics sandbox where you pick a boat and sink it. 54 hulls, including the Titanic. Water, fire, and explosions. Sandbox and Arcade. Co-op or Versus for 2–4 players over Game Center or nearby Wi-Fi. No ads, no in-app purchases, no analytics. Made by one developer. A neighboring "boat game" could not truthfully copy the hull count, the Titanic, the cell-based flooding, or the no-tracking claim.

## Operating Context

The page lives at `https://chesleybrown.ca/scuttle/` and is linked from Chesley's portfolio. Visitors arrive from search, the portfolio, or the App Store listing. The App Store smart banner can appear in iOS Safari. Purchase happens on the App Store, not on this page. Support is the FAQ plus email. The privacy policy is `web/scuttle/privacy.html`.

## Capabilities and Constraints

Confirmed from the shipping page and the brief:

- 54 hulls: dinghies, tugs, galleons, container ships, aircraft carriers, supertankers, an oil rig with a live well, and the Titanic.
- Damage is cells. Wood splinters, steel buckles, water floods whatever you open. Weapons run from arrows through missiles, torpedoes, lasers, bombs, mines, TNT, and asteroids, up to a nuke. Storms, hurricanes, and tornadoes sink boats too.
- Sandbox and Arcade. Co-op and Versus, 2–4 players. 8 Game Center leaderboards. Nearby play is peer-to-peer Wi-Fi and does not leave the room.
- $1.99 once. iPhone and iPad. iOS 15 and iPadOS 15 or later. Landscape only, so the sea gets the width of the screen. Family Sharing. Rated 9+ for infrequent cartoon or fantasy violence.
- Built in Swift and SwiftUI. Metal draws the water and sprites. Box2D for rigid bodies. Lockstep: every device runs the same simulation. No game server of Chesley's.
- Solo play needs no account. Online play uses Apple's Game Center.

Page constraints:

- Keep the SEO work: the title, meta description, canonical `https://chesleybrown.ca/scuttle/`, the H1 "Scuttle" with "Boat sinking game for iPhone", the JSON-LD blocks (VideoGame, SoftwareApplication, MobileApplication, VideoObject, FAQPage, and no AggregateRating), the "What is Scuttle?" content, and the FAQ text in sync with the JSON-LD.
- Keep the App Store links (`id6814644019`).
- Do not change `vercel.json`.
- Static and fast. No new heavy dependencies.
- The mobile footer is not sticky. It has to work in iOS Safari, including iPad.
- Do not invent testimonials, ratings, press quotes, logos, or numbers.

Undecided, and not to be filled in: public ratings, download counts, press quotes, and review excerpts. Only Chesley can supply those.

## Brand Commitments

The name is Scuttle. The App Store name is Scuttle: Boat Sandbox. Voice: confident, specific, and game-first, the way a solo indie developer would write about their own game. Pixel-art character comes from the game, not from a startup template. No filler labels (Chesley already rejected a "30 seconds of gameplay. No voiceover." line) and no marketing-speak.

The page already shares the portfolio's night sea and sunset colors, and the CB mark links back to `https://chesleybrown.ca/`. That family stays. Do not restyle this page into a generic SaaS landing template.

## Evidence on Hand

Real, in the repo:

- Gameplay stills in `web/scuttle/media/` (menu, Titanic, galleon, hurricane, co-op, versus, nuke, storm, night storm, meteors), plus `poster.webp` and `trailer.mp4`.
- App icon `web/scuttle/icon.png`. Open graph image `web/scuttle/og.jpg`.
- Official badge `web/scuttle/app-store-badge.svg`.

Not on hand, and must not be invented: testimonials, star ratings, press logos, download totals, awards.

## Product Principles

- Show the game. The trailer and the shots are the point of the visit.
- Say the concrete thing: 54 hulls, $1.99, the Titanic, no ads. Skip category language.
- One purchase, nothing tracking you. Say it plainly.
- The page is a store visit and a help page. It is not a launch site for a platform.
- Do not claim proof you cannot show.

## Accessibility & Inclusion

The page has to be readable and tappable in iOS Safari on a phone and an iPad, and at a desktop width. Body text at least WCAG AA contrast against its background. The App Store badge keeps its visible name. The FAQ stays text, not an image. Keyboard focus stays visible. Reduced motion is already respected for smooth scrolling.
