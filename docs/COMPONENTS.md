# Components (`src/native/`)

React Native + NativeWind, shipped as TS source. `className` (where offered) is for
margins/layout tweaks only — visual identity stays inside the component. Avatar,
ConfirmButton, and Icon take no `className`. Import from `@onli/ui`.

## Text
`<Text variant tone size className …TextProps>` — caps OS font scaling at 1.3× for chrome
and 2× for `selectable` user content (`maxFontSizeMultiplier` overrides). Controls use
`min-h-*`, never `h-*`, so scaled text never clips.
- `variant`: `title` (section titles), `heading` (card/post titles), `subheading` (bold UI),
  `body` (default), `body-sm`, `label` (buttons/forms/tabs), `caption` (defaults to muted tone).
- `tone`: `default | secondary | muted | faint | inverse | brand | on-brand | accent | danger`.
- `size`: a type-scale step (`xs`…`3xl`) that replaces the variant's size — e.g.
  `variant="body" size="sm"` for a dense row. There is no 15px step. Prefer this over a
  `text-*` class in `className`.
- Non-selectable by default (UI chrome must not highlight on click); pass `selectable` on user
  content — post bodies, comments, bios, descriptions.
- Title/heading variants apply negative tracking; a caller `tracking-*` class replaces it.
- Overrides are safe: when `className` sets a font (`font-*`), a size (`text-sm`, `text-[15px]`…),
  a color (`text-brand`…, including `text-rarity-*`, `text-rank-*`, `text-heat-*`), or tracking,
  the variant/tone class for that group is dropped, so the caller's class always wins regardless
  of stylesheet order.

## Button
`<Button title variant size icon loading disabled …PressableProps>`
- `variant`: `primary` (green pill), `secondary` (white + border), `tonal` (green-subtle),
  `ghost`, `danger` (subtle red). `size`: `sm | md | lg` (heights 36/44/48).
- `icon` takes a lucide icon component. Web gets hover states; all get pressed states.
- `loading` swaps the label for a spinner visually only: the button keeps `title` as its
  accessible name and reports `busy`, so assistive tech never hears an unnamed control.

## IconButton
`<IconButton icon accessibilityLabel size tone variant …>` — 40px round hit target.
`accessibilityLabel` is **required**: the glyph is the only content, so the label is the
button's whole name to a screen reader ("Back", "Search", "Close"). `variant`: `default`
(transparent, hover/press wash) or `primary` (brand fill + on-brand icon, e.g. a send
button). Disabled state dims to 40% like Button.

## Card
`<Card padded onPress className>` — white, `rounded-xl`, hairline border, clips children
(`overflow-hidden`) so full-bleed rows/images respect the corners. `onPress` makes it
pressable with hover/press states and the `button` role; pass `accessibilityRole="link"`
when the card navigates. `padded` (default) = `p-5`.

## Avatar
`<Avatar name imageUrl size ImageComponent>` — sizes `xs`24 `sm`32 `md`40 `lg`64 `xl`96.
With no photo it falls back to one neutral person glyph (sunken disc, `ink-faint` figure),
the same mark for every member: a placeholder should read as "no photo yet", not as an
identity, and a feed of coloured monograms competes with the members who did upload one.
Both forms are an `image` named after the person. Pass expo-image's `Image` as
`ImageComponent` in the app for caching/transitions; it receives `accessibilityLabel` and
must forward it.

## Chip
`<Chip label selected onPress>` — pill tag; selected = brand fill plus a check glyph, so
colour is never the only cue. Pressable chips report `selected` state and carry 8px hitSlop.

## CountBadge / Pill
`<CountBadge count>` — unread counter (`danger` fill, 6:1 with the label, 11px), caps at 99+,
renders nothing at 0. Hidden from assistive tech: put the count in the label of the control
it decorates ("Notifications, 3 unread").
`<Pill label tone size>` — status pill. Status tones: `neutral | brand | accent | danger`.
Rarity tones for earned badges: `common | uncommon | rare | legendary` — the grey → green →
blue → gold ladder, identical to `BadgeMedal`'s, so a rarity never wears two colours. `size`: `sm` (default, 11px — inline metadata like "Pinned") or
`md` (roomier padding — standalone chips like profile badges); both are 12px, the floor of the
type scale. Badge rarity comes from the API;
see `onli-server/docs/PROGRESSION.md`.

## Input
`<Input label error helper multiline …TextInputProps>` — white field, `rounded-lg`,
`line-input` border, focus border on web, error/helper line below. `label` doubles as the
accessible name (pass `accessibilityLabel` to override); `error` sets `aria-invalid` and is
announced. `multiline` gives 120px min height, top-aligned.

## Divider, Skeleton
`<Divider/>` — hairline. `<Skeleton className="h-4 w-40"/>` — pulsing placeholder block;
`rounded-sm` by default, override with a radius class (`rounded-full` for avatar circles).
The classes sit on a plain `View` wrapping the animated fill — NativeWind does not interop
`Animated.View`, so a `className` there would be dropped.

## ListRow
`<ListRow title subtitle left right chevron dense onPress accessibilityRole>` —
settings/notification style row. `dense` is the compact variant (rails, secondary lists):
tighter padding, label-weight two-line title, caption subtitle, 16px chevron. With `onPress`
the row is a `button`; pass `accessibilityRole="link"` when it navigates.

## Segmented
`<Segmented options value onChange>` — pill switcher (e.g. Top/New) on a sunken track.
Exposed as a `tablist` of `tab`s with the active one `selected`.

## EmptyState
`<EmptyState icon title message action>` — centered; icon sits in a brand-subtle circle,
`action` slot for a Button.

## ConfirmButton
`<ConfirmButton label confirmLabel onConfirm small>` — two-tap destructive pattern (first tap
arms for 8s, second fires). Arming is announced and reported as `expanded`; `small` carries
10px hitSlop so the target still reaches 44px. Works on web and native; no Alert.

## Icon
`<Icon icon={Home} size tone strokeWidth fill>` — lucide wrapper wired to semantic colors
(default 1.8 stroke). `fill` takes a semantic color for filled glyphs (liked heart, streak
flame); omit it for the default outline.

## IconCircle
`<IconCircle icon size iconSize tone strokeWidth fill>{children}` — circular tinted glyph
holder (rail icons, notification glyphs, empty states, play overlays). `size` is the circle
diameter in px (default 40); the icon defaults to ~45% of it. Tones pair a tint with an icon
color: `brand` (subtle), `brand-faint`, `accent`, `danger`, `neutral`, `overlay` (scrim over
media). `children` (an emoji/character) replaces `icon`.

## SectionLabel
`<SectionLabel className>` — the 12px sentence-case muted section label (sidebar groups, rail
headings, in-page sections), exposed as a level-2 heading (`accessibilityRole="header"`,
`aria-level` 2 on web) so screen readers can jump between sections. Never uppercase. Carries
no margins; spacing belongs to the layout around it.

## FormError
`<FormError message tone size className>` — a form's error or status line. Renders nothing
while `message` is empty; when it appears it is a live region (`role="alert"` / `aria-live`
on web and Android) and is announced on iOS via `announce()`. `tone="status"` for
confirmations ("Copied", "Saved"). Use it for every inline error instead of a red `Text`.

## announce, useReducedMotion (`@onli/ui`)
`announce(message)` speaks a message on iOS VoiceOver (no-op elsewhere, where live regions
do the job). `useReducedMotion()` reports the OS / browser reduce-motion setting and follows
changes; `Skeleton` uses it, and any consumer animation should.

## Spinner
`<Spinner size tone className>` — brand-colored ActivityIndicator (`large` by default) so
screens never reach into tokens for the color.

## Stat
`<Stat label value className>` — big number over a caption label (profile counts, rail
progress).

## Wordmark
`<Wordmark size className>` — the "Onli." logo (brand-strong + accent period). Sizes:
`sm` 22px (nav bars), `md` 24px (default, drawers), `xl` 44px (sign-in hero). The px
metrics live in `src/wordmark.ts` (`wordmarkSizes`, also exported from `@onli/ui/wordmark`)
and are the logo's identity. Web consumers get the same logo from the generated
`@onli/ui/css/wordmark.css`: `<span class="wordmark wordmark-sm">Onli<span
class="wordmark-dot">.</span></span>` — never hand-build the wordmark in either kit.

## Channel icons (`@onli/ui/channel-icons`)
A vendored 36-icon subset of [Twemoji](https://github.com/jdecked/twemoji) v17.0.3, exported
as `channelIcons` (name → inline SVG string), `channelIconNames`, `isChannelIcon`, and
`getChannelIcon`.

**Look a name up with `getChannelIcon(name)` (or guard with `isChannelIcon`), never by
indexing `channelIcons` directly.** Names come from the database, and indexing a plain object
with a prototype name such as `constructor` returns a function, not an SVG string — which is
exactly what crashed the medal builder once. Both helpers use `Object.hasOwn`, so an unknown or
prototype name is simply `undefined` and the caller falls back to the channel's initial. The
same rule applies to `badgeIcons` and `rankInsignia` below.

Flat multi-colour art, deliberately unlike the monochrome lucide icons used for navigation —
shape and colour together are what tell a channel apart from a nav row. Bundled SVG rather
than emoji characters, because emoji are font glyphs and their artwork changes with the
viewer's OS and browser.

Inline strings, not files: `react-native-svg`'s `SvgXml` takes a string, and onli-admin
renders the same markup on the web, so one representation serves both with no asset pipeline.
The whole set is ~38 KB.

Curated for legibility at 18px — detailed emoji collapse into a dark blob at that size (🛟
was cut for exactly this). Check any addition at 18px before adding it.

Regenerate with `bun run fetch-icons`. **Graphics are CC-BY 4.0; attribution is required and
lives in `NOTICE.md`.**

## BadgeMedal
`<BadgeMedal code icon ruleType rarity earned size accessibilityLabel />` — a badge. Pass
`accessibilityLabel` ("First post, uncommon badge") when it stands alone; omit it when the name
is rendered beside it and the badge is hidden from assistive tech.

**Two paths, one geometry.** A badge in the seeded catalogue has its OWN DRAWING in
`@onli/ui/badge-art`, keyed by `code`: the family frame filled in the badge's own colour with
the artwork on top. A badge staff create later has no drawing and falls back to a struck medal
— frame in the rarity's dark metal, solid face, its lucide glyph in white. Both share the frame,
so a new badge sits in a row of drawn ones without looking like a different kind of object.

**Shape is the family**, from `ruleType`: hexagon = craft, squircle = volume, rosette = impact,
diamond = consistency, seal = identity. Derived, never stored — the catalogue's families already
ARE the rule types. The shapes avoid the shield and star that belong to the rank insignia.

**Colour is identity, not rarity** — one hue per badge, except legendary, which is always gold
so the rarest tier still reads at a glance. Rarity survives as the word on the Progress screen
and as `Pill`'s rarity tones. This replaced a four-colour rarity ladder: four colours across 24
badges cannot look alive, which is what Discord's badges do and ours did not (Himanshu,
2026-09-08).

**No `<defs>`, no `url(#…)`, anywhere — a hard rule, not a preference.** A badge is drawn inline
in onli-app (many svgs in one document), as a data-URI `<img>` in onli-admin, and natively on a
phone. A gradient must be referenced by a document-wide id, and duplicate ids across inline svgs
resolve to whichever definition the document saw first — which is how an earlier gradient
version rendered filled on the own-profile screen and hollow on the public one, from the same
component with the same props. The rank insignia, painted entirely through such references, drew
nothing at all.

`earned={false}` renders the same drawing in the paper's greys (`LOCKED_PALETTE`), so what a
member is working toward is recognisably what they will get. The fallback medal greys the same
way.

Default `size` 40, which is what both profile shelves use; 32 is the smallest in use (the admin
table), and the art holds at 22.

## Badge art (`@onli/ui/badge-art`)
One hand-authored drawing per badge code, plus `badgeArtPalette` (the badge's hue, gold when
legendary, greys when locked) and `hasBadgeArt` (which onli-admin uses to tell staff their glyph
pick is unused).

Rules for adding one, all learned by drawing the first set and looking at it at 40px:
- **One bold subject.** The first Founding Member was a banner plus a pole plus a mound plus a
  star; it turned to mush and is now a single pennant.
- **Two or three flat fills.** `ink` carries the subject (white on every earned badge), `soft`
  its interior detail, `deep` the one accent giving it an edge.
- **Nothing thinner than ~2 units** — 1.7px at 40px, and anything under a pixel fuzzes.
- **Author against the 26-unit box a circle holds** (11 to 37). `ART_FIT` in `badge-medal-svg`
  shrinks the drawing per frame, because a rhombus of half-diagonal 20 holds only a 20-unit
  square: the calendar and the crown hung out of their diamond corners until it did.
- Take the palette as an argument; never hardcode a hex, or the badge cannot render locked.

## RankInsignia
`<RankInsignia rank size muted />` — the emblem for a rung of the standing ladder, composed by
`rankInsigniaSvg` in `@onli/ui/rank-insignia-svg`: a shield filled in the rung's own colour
(`rank-{tier}`) carrying the rung's drawing from `@onli/ui/rank-art`. Built exactly the way
`BadgeMedal` is — one SVG string, flat fills, no CSS — so a badge and an insignia in one row
are the same kind of object.

`rank` is the rung's **permanent key** (`beginner`, `enthusiast`, …), never its name:
Admin → Levels can rename a rung, and a rename must not swap or orphan its mark. A rung with
no artwork renders nothing, leaving the rank name standing on its own exactly as it did
before insignia existed.

`muted` is a rung the member has not reached: the same drawing in the paper's greys
(`LOCKED_PALETTE`, shared with a locked badge), so arriving at one reads as a gain.

**No gradients here either**, for the reason above: the emblem is inline SVG in a page holding
many others, and the gradient version painted the mark *entirely* through `url(#…)`, so it
occupied its box and drew nothing on every screen it appeared on.

Default `size` 24. **Do not size it below 20** — the top rungs carry laurel and crown detail
and a 13px copy is a smudge. Bylines stay text-only for that reason. 20 sits in the profile
meta pill, 28 in a ladder row, 40 on a card beside the streak's flame circle. **It draws its
own frame: never wrap it in an `IconCircle`.**

## Badge icons (`@onli/ui/badge-icons`)
A curated 48-icon subset of [Lucide](https://lucide.dev), exported as `badgeIcons`
(name → inline SVG string), `badgeIconNames`, `isBadgeIcon`, and `getBadgeIcon` (look names
up through the getter, as for channel icons). 24 are the shipped badges; the rest are spares
so staff can add a badge in the admin panel without a deploy.

Monochrome stroke art, deliberately unlike the flat multi-colour channel icons: a badge's
colour is its rarity, so the glyph must not compete for it. `currentColor` is left in the
markup — `SvgXml` resolves it from its `color` prop, and onli-admin substitutes a hex before
building the data URI.

Built **offline** from the installed `lucide-react-native` rather than fetched, so the
artwork can never drift from the `lucide-react` copy onli-admin renders. Regenerate with
`bun run build-badge-icons`, then `bun run format` (the generated object literal is not
pre-formatted). ISC; attribution lives in `NOTICE.md`.

## Badge medal (`@onli/ui/badge-medal-svg`)
`badgeMedalSvg({ icon, ruleType, rarity, earned })` returns the complete medal as an SVG
string; `shapeForRule(ruleType)` exposes the shape mapping on its own. onli-app renders the
string through `SvgXml`, onli-admin through a data-URI `<img>` — one builder, so a shape and
colour staff pick in the panel is exactly what a member sees.

Geometry is a runtime module rather than a generated file because the colours are composed per
call; only the glyph paths are generated (`badge-icons.ts`).

Gradient ids are keyed by rarity (`of-rare`) rather than made unique per instance: several
medals of one tier inlined into the same document then share one identical definition instead
of colliding on different ones.

## Rank art (`@onli/ui/rank-art`)
Six hand-authored drawings, one per rung, keyed by rung key: `rankArt(key, palette)`,
`rankArtPalette(key, muted)`, `rankKeys`, `isRankKey`, and the `RankKey` type. The badge
treatment applied to standing: a white subject on the rung's colour, with one lighter tint
(`soft`) for a lit facet or the wreath and one darker (`deep`) for a shadow or band. The
frame is a **shield** — the one silhouette the badge frames avoid, and what games put a rank
in — the same for every rung, so what changes between rungs is the colour and the object.

**Each rung is a different object**: sprout, arrow, bolt, star, star over a laurel cradle,
crown — paired with its own tier colour. Ornament is spent carefully: a full wreath around
the mentor star lost at 28px (ring and star fought for the same pixels), so the laurel sits
under the star, and the master crown fills the shield on its own. The first pass made all six a laurel that only grew
fuller, and neighbouring rungs were impossible to tell apart in isolation, which is the whole
job of an insignia. Games escalate the object itself rather than its density, and so do these.
The series reads as what standing means at each rung: you started, you are climbing, you can
be relied on, you are distinguished, others learn from you, you have mastered it.

**Nothing counts.** Ornament escalates, but no rung is "three of something" — that is an
ordinal in disguise, which is the thing `onli-server/docs/PROGRESSION.md` exists to keep off
the screen.

Drawing rules are the badge art's (above), checked at the sizes that ship — 20, 28, 40 —
by rendering at 1× and upscaling the PNG: one bold subject, two or three flat fills, nothing
under ~2 units, no `<defs>`, no `url(#…)`. `bg` comes from the `rank-*` token so the ladder's
colour stays in one place; `soft` and `deep` are picked by eye per hue. The shield is 36
wide at the top and narrows fast below y=30, so a subject sits a little above centre — top
edge at y≈10-11, nothing wider than ±10 once below y=30 — and every element, shadow included,
keeps at least 3.5 units from the outline. Check margins numerically against the shield's
curve rather than by eye: the first arrow and crown shadows leaked through the lower edge
and only a 96px render showed it.
