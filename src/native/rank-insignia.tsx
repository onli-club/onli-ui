import { rankInsigniaSvg } from "../rank-insignia-svg";
import { SvgImage } from "./svg-image";

/**
 * The emblem for a rung of the ladder: a shield in the rung's colour carrying its drawing,
 * from `@onli/ui/rank-art`, composed by `rankInsigniaSvg`. Built the way `BadgeMedal` is, so
 * the two sit together as one kind of object.
 *
 * Takes the rung's permanent `key`, never its name — Admin -> Levels can rename a rung, and a
 * rename must not swap its mark. A rung with no artwork renders nothing, which leaves the
 * rank name standing on its own exactly as it did before insignia existed.
 *
 * `muted` is a rung the member has not reached — the same drawing in the paper's greys, as a
 * locked badge is, which is what makes reaching it read as a gain.
 *
 * Hidden from assistive tech: the rung's name is always text beside it.
 *
 * Not sized below 20 — the top rungs carry laurel and crown detail. It draws its own frame,
 * so never wrap it in an IconCircle. Bylines stay text-only.
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
  return xml ? <SvgImage xml={xml} size={size} /> : null;
}
