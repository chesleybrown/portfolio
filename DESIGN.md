---
name: Scuttle
description: A night poster for a pixel-art boat-sinking game.
colors:
  night: "#0b1026"
  night-raised: "#121a3a"
  night-line: "#1b2550"
  ink: "#f6f1e7"
  ink-quiet: "#b9bfd9"
  sunset: "#ff8a3d"
  flare: "#ff4d8d"
  signal: "#ffd23f"
  rust: "#7a2f10"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(60px, 16vw, 92px)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(32px, 4.6vw, 48px)"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  none: "0px"
  icon: "22px"
spacing:
  gutter: "clamp(16px, 5vw, 56px)"
  section: "clamp(52px, 8vw, 96px)"
  stack: "22px"
components:
  wordmark:
    textColor: "{colors.sunset}"
    typography: "{typography.display}"
  nav-link:
    textColor: "{colors.ink-quiet}"
    typography: "{typography.label}"
    height: "44px"
  text-link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  app-icon:
    rounded: "{rounded.icon}"
    width: "96px"
    height: "96px"
---

# Design System: Scuttle

## Overview

**Creative North Star: "The night poster"**

The page is a poster for the game, stuck up at night. The sea is the same dusk navy as the portfolio. The sunset orange is spent on the name. Everything else gets out of the way so the trailer and the shots can be the game.

It should read like one person made a page for their own game: specific, a bit blunt, no launch-site furniture. The pixel art is in the pictures and in the one hard shadow under the word Scuttle. It is not a texture pasted onto labels.

**Key Characteristics:**

- One type family, Bricolage Grotesque, in three weights
- Night ground, cream type, one sunset accent
- Square frames on the game pictures
- The App Store badge left as Apple drew it
- The mobile purchase row sits in the page, and does not stick

## Colors

Dusk navy, sail cream, and the sunset from the app icon. Pink and yellow are for the browser, not for decoration.

### Primary

- **Sunset** (`sunset`): the word Scuttle, the square bullets on the spec list, the underline on text links, and the first square of the CB mark.

### Secondary

- **Flare** (`flare`): text selection, and the second square of the CB mark. It is the pink in the icon's sky, used twice and then stopped.

### Tertiary

- **Signal** (`signal`): the keyboard focus ring and the skip link. A focus state, not a highlight color for marketing.

### Neutral

- **Night** (`night`): the page background and the solid header.
- **Night raised** (`night-raised`): the flat color behind a shot while it loads.
- **Night line** (`night-line`): the hairline under the header, between build notes, between answers, and the scrollbar thumb.
- **Ink** (`ink`): reading text, headings, the rating line.
- **Ink quiet** (`ink-quiet`): the header links, shot captions, and the footer. It stays above 10:1 on Night.
- **Rust** (`rust`): the offset under the word Scuttle. Not a fill.

**The One Voice Rule.** Sunset is the accent. If a second color is doing the same job, take it off.

**The Cream for Reading Rule.** Paragraphs, answers, and the rating line are Ink. Quiet ink is for chrome a person can skip past, and it still has to pass AA.

## Typography

**Display Font:** Bricolage Grotesque (with system-ui, sans-serif)
**Body Font:** Bricolage Grotesque (with system-ui, sans-serif)

**Character:** One grotesque. The game's own pixel type stays inside the screenshots. A second pixel font on the labels was costume.

### Hierarchy

- **Display** (800, clamp(60px, 16vw, 92px), 1.05, tracking -0.03em): the word Scuttle only. On a wide screen the size caps near 6rem so the poster beside it stays the larger object. The rust offset is `4px 4px 0`.
- **Headline** (800, clamp(32px, 4.6vw, 48px), 1.4, tracking -0.03em): section headings. They wrap, so the leading stays open.
- **Title** (700, 22px, 1.45): the four things the sandbox does. The question "What is Scuttle?" uses the same size so it introduces one paragraph and does not shout over the shots heading.
- **Body** (400, 17px, 1.6): the page. The definition and the section leads step up to 18px. Measure stays near 66ch.
- **Label** (400, 15px, 1.4): shot captions and the footer. Header links are 16px at weight 700, with a 44px hit target. Sentence case.

### Named Rules

**The No Eyebrow Rule.** Nothing sits above a heading to name the section. The heading is the name.

**The One Family Rule.** Do not load a monospace or a pixel face for labels. If the text is not the word Scuttle, it is Bricolage.

## Layout

A single column on a phone and on an iPad held upright. The column is `min(1120px, 100% - gutter)`, gutter `clamp(16px, 5vw, 56px)`.

From 720px, the sandbox notes and the build notes sit in two columns, and the app icon sits beside the maker paragraph. From 960px, the hero is the name on the left and the trailer on the right, and the header shows the App Store badge. The purchase row at the bottom hides at that width because the header badge stays on screen.

The shot row breaks out of the column and scrolls sideways. Each frame is `min(84vw, 560px)`, so the next picture peeks in. Section padding is `clamp(52px, 8vw, 96px)` above the heading and almost nothing below it. "What is Scuttle?" sits closer, `clamp(32px, 5vw, 48px)`, because it belongs to the hero.

In-page links clear the sticky header with `scroll-padding-top: calc(64px + env(safe-area-inset-top))`.

## Elevation & Depth

The page is flat. Depth is the night getting a hairline, and one stamped shadow.

### Shadow Vocabulary

- **Wordmark stamp** (`text-shadow: 4px 4px 0 #7a2f10`): the word Scuttle only.

### Named Rules

**The One Shadow Rule.** That offset is the pixel stamp on the name. It does not move to buttons, cards, or the app icon. The icon is the icon, with the iOS corner and no shadow.

## Shapes

Corners are square. The game frames, the video, the purchase row, and the links are square. The app icon is the exception: a 22px radius on a 96px image, which is how it sits on a home screen.

Rules are 1px Night line. They separate rows in the build notes and the answers. They do not box a fact.

## Components

### Buttons

There is no drawn button. The action is the official App Store badge, used at 54px in the hero and the price block and at 40px in the header and the bottom row. Do not recolor it, shadow it, or put it on a pill.

The way back to the portfolio is a text link, not a button.

### Cards / Containers

No cards. A fact is a heading and a paragraph, or a row with a hairline. The price is a heading, "$1.99, once.", then a short list.

### Navigation

Sticky, solid Night, 1px line on the bottom. No blur. Links are Play (the trailer), Shots, and Support, in the body face, quiet ink, 44px tall. The CB mark is the two squares from the portfolio, sunset and flare, and it links home.

### Shot row

Real gameplay stills, square, with a 15px caption in quiet ink. The row scrolls. The first frame is the Titanic.

### Build notes and answers

A term and a sentence, divided by a hairline. Answers use the same row. The question is weight 700. The answer is body.

### Purchase row

In normal flow, under the answers, on viewports under 960px. Price on the left, badge on the right, a hairline above. It is not fixed. The footer follows it and carries the home-indicator padding.

## Do's and Don'ts

### Do

- **Do** lead with the name, the line "Pick a boat. Drop it in the sea. See what it takes to sink it.", the badge, and the trailer.
- **Do** keep "What is Scuttle?" and the definition on the page, in that order, under the trailer.
- **Do** keep the FAQ sentences identical to the FAQPage JSON-LD.
- **Do** put the 9+ reason next to the badge. The page already states it.
- **Do** keep body text in Ink, on Night, at 17px or larger.

### Don't

- **Don't** put a small uppercase label above a heading.
- **Don't** put facts in rounded gradient cards, or draw a cyan line around them.
- **Don't** use a monospace face, a pixel face, or an emoji as an icon.
- **Don't** stick the mobile purchase row or the footer. iOS Safari already has its own bar, and the smart banner covers that browser.
- **Don't** invent a rating, a quote, a logo, a download count, or a review.
- **Don't** restyle the App Store badge.
- **Don't** add a grain overlay, a glow, or a background grid. The pictures are already textured.
