# Components (`src/native/`)

React Native + NativeWind, shipped as TS source. `className` (where offered) is for
margins/layout tweaks only — visual identity stays inside the component. Avatar,
ConfirmButton, and Icon take no `className`. Import from `@onli/ui`.

## Text
`<Text variant tone size className …TextProps>`
- `variant`: `title` (section titles), `heading` (card/post titles), `subheading` (bold UI),
  `body` (default), `body-sm`, `label` (buttons/forms/tabs), `caption` (defaults to muted tone).
- `tone`: `default | secondary | muted | faint | inverse | brand | on-brand | accent | danger`.
- `size`: a type-scale step (`xs`…`3xl`) that replaces the variant's size — e.g.
  `variant="body" size="md"` for 15px dense body, `variant="subheading" size="md"` for 15px
  emphasis. Prefer this over a `text-*` class in `className`.
- Non-selectable by default (UI chrome must not highlight on click); pass `selectable` on user
  content — post bodies, comments, bios, descriptions.
- Title/heading variants apply negative tracking; a caller `tracking-*` class replaces it.
- Overrides are safe: when `className` sets a font (`font-*`), a size (`text-sm`, `text-[15px]`…),
  a color (`text-brand`…), or tracking, the variant/tone class for that group is dropped, so the
  caller's class always wins regardless of stylesheet order.

## Button
`<Button title variant size icon loading disabled …PressableProps>`
- `variant`: `primary` (green pill), `secondary` (white + border), `tonal` (green-subtle),
  `ghost`, `danger` (subtle red). `size`: `sm | md | lg` (heights 36/44/48).
- `icon` takes a lucide icon component. Web gets hover states; all get pressed states.

## IconButton
`<IconButton icon size tone variant …>` — 40px round hit target. `variant`: `default`
(transparent, hover/press wash) or `primary` (brand fill + on-brand icon, e.g. a send
button). Disabled state dims to 40% like Button.

## Card
`<Card padded onPress className>` — white, `rounded-xl`, hairline border, clips children
(`overflow-hidden`) so full-bleed rows/images respect the corners. `onPress` makes it
pressable with hover/press states. `padded` (default) = `p-5`.

## Avatar
`<Avatar name imageUrl size ImageComponent>` — sizes `xs`24 `sm`32 `md`40 `lg`64 `xl`96.
Initials fallback uses a deterministic warm color duo from the name. Pass expo-image's
`Image` as `ImageComponent` in the app for caching/transitions.

## Chip
`<Chip label selected onPress>` — pill tag; selected = brand fill. For tags and filters.

## CountBadge / Pill
`<CountBadge count>` — red unread counter, caps at 99+, renders nothing at 0.
`<Pill label tone size>` — status pill. Status tones: `neutral | brand | accent | danger`.
Rarity tones for earned badges: `common | uncommon | rare | legendary` — the grey → green →
blue → gold ladder, identical to `BadgeMedal`'s, so a rarity never wears two colours. `size`: `sm` (default, 11px — inline metadata like "Pinned") or
`md` (12px, roomier — standalone chips like profile badges). Badge rarity comes from the API;
see `onli-server/docs/PROGRESSION.md`.

## Input
`<Input label error helper multiline …TextInputProps>` — white field, `rounded-lg`, focus
border on web, error/helper line below. `multiline` gives 120px min height, top-aligned.

## Divider, Skeleton
`<Divider/>` — hairline. `<Skeleton className="h-4 w-40"/>` — pulsing placeholder block;
`rounded-sm` by default, override with a radius class (`rounded-full` for avatar circles).

## ListRow
`<ListRow title subtitle left right chevron dense onPress>` — settings/notification style
row. `dense` is the compact variant (rails, secondary lists): tighter padding, label-weight
two-line title, caption subtitle, 16px chevron.

## Segmented
`<Segmented options value onChange>` — pill switcher (e.g. Top/New) on a sunken track.

## EmptyState
`<EmptyState icon title message action>` — centered; icon sits in a brand-subtle circle,
`action` slot for a Button.

## ConfirmButton
`<ConfirmButton label confirmLabel onConfirm small>` — two-tap destructive pattern (first tap
arms for 3s, second fires). Works on web and native; no Alert.

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
`<SectionLabel className>` — the uppercase 12px muted section label (sidebar groups, rail
headings, in-page sections). Carries no margins; spacing belongs to the layout around it.

## Spinner
`<Spinner size tone className>` — brand-colored ActivityIndicator (`large` by default) so
screens never reach into tokens for the color.

## Stat
`<Stat label value className>` — big number over a caption label (profile counts, rail
progress).

## Wordmark
`<Wordmark size className>` — the "Onli." logo (brand-strong + accent period). Sizes:
`sm` 22px (nav bars), `md` 24px (default, drawers), `xl` 44px (sign-in hero). The px
metrics are the logo's identity and live only here — never hand-build the wordmark.

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
`<BadgeMedal icon ruleType rarity earned size />` — a badge rendered as a struck medal.

**Two axes, not one. `shape` says what KIND of thing the member did; colour says how rare it
is.** A wall of identical discs made every badge look like every other, which is the whole
problem a badge set exists to solve. Shape is derived from `ruleType` — the catalogue's
families already *are* the rule types, so a `shape` column would duplicate them and a badge
staff add later would need an extra decision:

| Shape | Rule types | Reads as |
|---|---|---|
| hexagon | `channel_post_count` | craft, one per topic channel |
| squircle | `post_count`, `comment_count`, `channels_posted` | volume |
| rosette | `likes_received_posts`, `single_post_comments`, `single_comment_likes` | impact — other people rated it |
| diamond | `streak_days` | consistency |
| seal | `profile_completed`, `founding_member`, `staff`, `course_completed`, `manual`, anything unknown | identity |

Shapes deliberately avoid the shield and star silhouettes — those belong to `RankInsignia`,
and the two systems must not be mistaken for each other.

`icon` is a name from `@onli/ui/badge-icons` (an unknown or null one falls back to `award`),
and comes from `badge.icon` in the API.

Rarity is the frame, not the glyph — scanning a wall of badges should show which ones are
scarce before a single name is read. The ramp is the one games already taught everyone:
**grey → green → blue → gold** (`rarity-*` tokens), because it is read without a legend, which
the no-tooltip rule needs. Legendary is the only FILLED tier — a solid gold disc with a 2px
darker-gold rim and a near-white glyph — so the rarest badges are the only ones carrying solid
colour. `Pill`'s rarity tones use the same four values: one rarity must never wear two colours.

Each medal is a **struck object**: the shape filled with a lit face gradient
(`rarity-{tier}-top` → `-bottom`, angled so the light comes from the upper left), a rim stroke,
and one overlay that does the whole emboss — a specular highlight across the top, nothing
through the middle, a contact shadow at the bottom. That overlay is a single gradient-filled
copy of the same path, so depth costs no extra edges.

**The emboss is gradients, not an SVG `<filter>`.** react-native-svg's XML parser maps
`feDropShadow` and `feGaussianBlur`, but filter *rendering* there is newer and uneven across
platforms, while gradients are long-supported and rasterise identically in React Native, on the
web, and inside onli-admin's data-URI. Geometry also stays crisp at any size, which a blur
does not.

`earned={false}` keeps the same shape in a dashed outline with a faint glyph and **no gradient
or emboss** — an unearned badge should not look struck.

**The whole medal is one SVG string** from `@onli/ui/badge-medal-svg`, shared with onli-admin
— not a bordered box painted by Tailwind. That is deliberate: the first version's disc colour
came from Tailwind classes, so medals rendered with no fill at all whenever the compiled CSS
was behind the tokens. Nothing in the medal touches CSS now.

Default `size` 40. Below ~24 the bevel line starts to crowd the glyph; 32 is the smallest
size in use (the admin table).

## RankInsignia
`<RankInsignia rank size muted />` — the emblem for a rung of the standing ladder, composed by
`rankInsigniaSvg` in `@onli/ui/rank-insignia-svg`.

`rank` is the rung's **permanent key** (`beginner`, `enthusiast`, …), never its name:
Admin → Levels can rename a rung, and a rename must not swap or orphan its mark. A rung with
no artwork renders nothing, leaving the rank name standing on its own exactly as it did
before insignia existed.

**Struck like the badge medals**: a lit face gradient in the rung's own metal
(`rank-{tier}-{top,bottom}`) plus one emboss overlay. One hue per tier is half of what makes a
mark identifiable on its own. `muted` renders it flat and drained to `ink-faint` for a rung the
member has not reached — deliberately *not* embossed, since the struck look is part of what
having reached a rung means.

The emboss is lighter than the medals'. A medal's overlay sits on one broad face; an emblem is
thin forms spread across the box, so the same strength reads as two colours rather than one
object — the sprout's low stem otherwise takes the dark end of both gradients at once.

Default `size` 24. **Do not size it below 18** — the top rungs carry laurel and crown detail
and a 13px copy is a smudge. Bylines stay text-only for that reason. 18 is the size that sits
level with a `SectionLabel`; 26 suits a ladder row and 44 a card.

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

## Rank insignia (`@onli/ui/rank-insignia`)
Six original marks, exported as `rankInsignia` (rung key → inline SVG string), `rankKeys`,
`isRankKey`, and `getRankInsignia` (look keys up through the getter, as for channel icons).
`rankInsigniaSvg` returns `undefined` for a key that is not one of the six, and every key
with artwork must also have a tier colour in `rank-insignia-svg.ts` — that map is typed by
`RankKey`, so leaving one out is a typecheck error rather than a mark that silently paints flat.

**Each rung is a different object**: sprout, chevron, shield, star, star in laurel, crowned
laurel — paired with its own tier colour. The first pass made all six a laurel that only grew
fuller, and neighbouring rungs were impossible to tell apart in isolation, which is the whole
job of an insignia. Games escalate the object itself rather than its density, and so do these.
The series reads as what standing means at each rung: you started, you are climbing, you can
be relied on, you are distinguished, others learn from you, you have mastered it.

**Nothing counts.** Ornament escalates, but no rung is "three of something" — that is an
ordinal in disguise, which is the thing `onli-server/docs/PROGRESSION.md` exists to keep off
the screen.

**Every coordinate is absolute — no element carries a `transform`.** A `userSpaceOnUse`
gradient resolves against the user space in effect where it is referenced, so a rotated leaf
would sample a rotated copy of the ramp and the sprout's stem and leaves would come out
different colours. Marks are built twice: once to measure, then again with the fit baked into
every point.

**Every mark is measured and normalised at build time**, not hand-tuned: each primitive
reports the points it occupies and the fit scales and centres the result into one optical
square. Hand-tuned coordinates could not hold six different shapes to one size — the
first attempt drifted from a 13-unit sprout to a 27-unit wreath that overflowed the viewBox
and rendered clipped, with every mark on a different vertical centre, so any row containing
them looked crooked. If you add a primitive, make it push its points **and** map them through
`XF`, or the mark will drift again.

Generated by `bun run build-rank-insignia` (then `bun run format`). Original artwork; no
third-party licence applies.
