import { SvgXml } from "react-native-svg";
import { rankInsigniaSvg } from "../rank-insignia-svg";

/**
 * The emblem for a rung of the ladder, from @onli/ui/rank-insignia.
 *
 * Takes the rung's permanent `key`, never its name — Admin -> Levels can rename a rung, and a
 * rename must not swap its mark. A rung with no artwork renders nothing, which leaves the
 * rank name standing on its own exactly as it did before insignia existed.
 *
 * Struck like the badge medals: a lit face gradient in the rung's own hue plus one emboss
 * overlay. `muted` is a rung the member has not reached — same emblem, flat and drained of
 * colour, which is what makes reaching it read as a gain.
 *
 * Not sized below 18 — the top rungs carry laurel and crown detail. Every mark is normalised
 * to one optical square by the build script, so a row of them lines up at any size.
 * Bylines stay text-only.
 */
export function RankInsignia({
  rank,
  size = 24,
  muted = false,
}: {
  rank: string | null | undefined;
  size?: number;
  muted?: boolean;
}) {
  const xml = rankInsigniaSvg({ rank, muted });
  if (!xml) return null;
  return <SvgXml xml={xml} width={size} height={size} />;
}
