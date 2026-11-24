import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  ConversionCanceledError,
  canEncode,
  canEncodeVideo,
  Input,
  type InputVideoTrack,
  MP4,
  Mp4OutputFormat,
  Output,
  Quality,
  StreamTarget,
} from "mediabunny";

/**
 * What an encode here produces: H.264 inside 1280×1280, AAC, MP4. The API then only checks the
 * file and copies it into place, so a 4 GB lecture costs it seconds. Lectures are low motion, so
 * they get the lower bitrate. `maxBitrate` is the server's ceiling for serving a file as it is.
 */
const ENCODE_TARGETS = {
  video: { maxEdge: 1280, videoBitrate: 2_500_000, audioBitrate: 128_000, maxBitrate: 6_000_000 },
  course_video: {
    maxEdge: 1280,
    videoBitrate: 2_000_000,
    audioBitrate: 96_000,
    maxBitrate: 5_000_000,
  },
} as const;

/** Baseline, Main, Extended and High: the H.264 profiles that only carry 8-bit 4:2:0. */
const YUV420P_PROFILES = new Set([66, 77, 88, 100]);

/**
 * Whether the server would serve this file as it is (onli-server `media/video.ts#meetsDeliverySpec`):
 * H.264 yuv420p inside 1920×1920, AAC or no audio, MP4 rather than QuickTime, under the bitrate
 * ceiling. Reads only the file's header, so a two-hour Zoom recording answers in under a second.
 */
async function servedAsIs(
  input: Input,
  track: InputVideoTrack,
  bytes: number,
  maxBitrate: number,
): Promise<boolean> {
  if ((await input.getFormat()) !== MP4 || (await track.getCodec()) !== "avc") return false;
  const profile = Number.parseInt((await track.getCodecParameterString())?.slice(5, 7) ?? "", 16);
  if (!YUV420P_PROFILES.has(profile) || (await track.getColorSpace()).fullRange) return false;
  if (Math.max(await track.getCodedWidth(), await track.getCodedHeight()) > 1920) return false;
  const audio = await input.getPrimaryAudioTrack();
  if (audio && (await audio.getCodec()) !== "aac") return false;
  const seconds = await input.computeDuration();
  return seconds > 0 && (bytes * 8) / seconds <= maxBitrate;
}

export type EncodeKind = keyof typeof ENCODE_TARGETS;

export const UNSUPPORTED_BROWSER_MESSAGE =
  "This browser cannot prepare videos. Use a current Chrome, Edge, Safari or Firefox.";

const UNREADABLE_RECORDING_MESSAGE =
  "This browser cannot read that video's format. Export it again as an MP4 (H.264), or try Chrome.";

/** Cheap synchronous check for the picker: is WebCodecs there at all? */
export const browserCanEncode = (): boolean =>
  typeof VideoEncoder !== "undefined" && typeof AudioEncoder !== "undefined";

/** The full check, once per session: can this machine actually produce H.264 + AAC at 720p? */
let supportPromise: Promise<boolean> | null = null;
function canEncodeDeliverySpec(): Promise<boolean> {
  if (!browserCanEncode()) return Promise.resolve(false);
  supportPromise ??= Promise.all([
    canEncodeVideo("avc", { width: 1280, height: 720 }),
    canEncode("aac"),
  ]).then((r) => r.every(Boolean));
  return supportPromise;
}

class EncodeUnsupported extends Error {
  constructor() {
    super(UNSUPPORTED_BROWSER_MESSAGE);
    this.name = "EncodeUnsupported";
  }
}

/**
 * The output goes to a temporary file in the browser's private origin file system when it can
 * (Chrome, Edge, Firefox), so a two-hour lecture never has to fit in memory. Safari has no
 * writable OPFS on the main thread and falls back to an in-memory buffer.
 */
async function openScratch(): Promise<{
  target: BufferTarget | StreamTarget;
  collect: () => Promise<File>;
}> {
  const name = `encode-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`;
  try {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle(name, { create: true });
    if (typeof handle.createWritable !== "function") throw new Error("no writable OPFS");
    const writable = await handle.createWritable();
    return {
      target: new StreamTarget(writable, { chunked: true }),
      collect: async () => {
        const file = await handle.getFile();
        // The bytes are read from the handle lazily, so the entry can be released once the
        // upload has finished with the File; the caller does that through `release`.
        scratch.set(file, () => root.removeEntry(name).catch(() => {}));
        return file;
      },
    };
  } catch {
    const target = new BufferTarget();
    return {
      target,
      collect: async () => new File([target.buffer as ArrayBuffer], name, { type: "video/mp4" }),
    };
  }
}

const scratch = new WeakMap<File, () => Promise<void>>();

/** Frees the scratch file behind an encoded output once it has been uploaded. */
export async function releaseEncoded(file: File) {
  await scratch.get(file)?.();
  scratch.delete(file);
}

export interface EncodeResult {
  file: File;
  /** False when the original goes up as it is. */
  transcoded: boolean;
}

/**
 * Encode a picked video to delivery spec in the browser. Throws `EncodeUnsupported` when there is
 * no WebCodecs to do it with — the caller decides whether that blocks the upload. A source already
 * at spec is returned untouched with `transcoded: false`. So is one the browser cannot decode (an
 * exotic codec), and the server encodes it instead; a class recording in that state throws,
 * because the server never encodes one.
 */
export async function encodeVideo(
  file: File,
  kind: EncodeKind,
  opts: { onProgress?: (fraction: number) => void; signal?: AbortSignal } = {},
): Promise<EncodeResult> {
  if (!(await canEncodeDeliverySpec())) throw new EncodeUnsupported();
  const target = ENCODE_TARGETS[kind];

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error("That file has no video track.");
  if (await servedAsIs(input, track, file.size, target.maxBitrate)) {
    input.dispose();
    return { file, transcoded: false };
  }
  const [w, h] = [await track.getDisplayWidth(), await track.getDisplayHeight()];
  const scale = Math.min(1, target.maxEdge / Math.max(w, h));
  const even = (n: number) => Math.max(2, Math.round((n * scale) / 2) * 2);

  const { target: outTarget, collect } = await openScratch();
  const output = new Output({ format: new Mp4OutputFormat(), target: outTarget });
  const conversion = await Conversion.init({
    input,
    output,
    tracks: "primary",
    video: {
      codec: "avc",
      width: even(w),
      height: even(h),
      fit: "contain",
      quality: new Quality({ bitrate: target.videoBitrate }),
      hardwareAcceleration: "prefer-hardware",
    },
    audio: { codec: "aac", quality: new Quality({ bitrate: target.audioBitrate }) },
    showWarnings: false,
  });

  if (conversion.discardedTracks.some((t) => t.reason === "undecodable_source_codec")) {
    await conversion.cancel().catch(() => {});
    input.dispose();
    if (kind === "course_video") throw new Error(UNREADABLE_RECORDING_MESSAGE);
    return { file, transcoded: false };
  }
  if (!conversion.isValid) throw new Error("This video cannot be prepared for upload.");

  const onAbort = () => void conversion.cancel();
  opts.signal?.addEventListener("abort", onAbort, { once: true });
  conversion.onProgress = (p) => opts.onProgress?.(p);
  try {
    await conversion.execute();
  } catch (e) {
    if (e instanceof ConversionCanceledError || opts.signal?.aborted) throw new EncodeAborted();
    throw e;
  } finally {
    opts.signal?.removeEventListener("abort", onAbort);
    input.dispose();
  }
  return { file: await collect(), transcoded: true };
}

export class EncodeAborted extends Error {
  constructor() {
    super("Encoding cancelled");
    this.name = "EncodeAborted";
  }
}
