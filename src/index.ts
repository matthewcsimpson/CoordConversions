import { AngleKind, Hemisphere, DD, DM, DMS } from "../types";
import { DEG_MAX } from "../data";




export function detectKindFromHemi(hemi: Hemisphere): AngleKind {
  return hemi === Hemisphere.N || hemi === Hemisphere.S
    ? AngleKind.LAT
    : AngleKind.LON;
}

function dirFromSign(kind: AngleKind, value: number): Hemisphere {
  if (kind === AngleKind.LAT) return value >= 0 ? Hemisphere.N : Hemisphere.S;
  return value >= 0 ? Hemisphere.E : Hemisphere.W;
}

function applyHemiToSign(value: number, hemi?: Hemisphere): number {
  if (!hemi) return value;
  if (hemi === Hemisphere.S || hemi === Hemisphere.W) return -Math.abs(value);
  return Math.abs(value);
}

function clampDegrees(kind: AngleKind, deg: number): number {
  const max = DEG_MAX[kind];
  if (deg > max) return max;
  if (deg < -max) return -max;
  return deg;
}

function ensureFinite(n: unknown, label = "number"): number {
  const v = typeof n === "string" ? Number(n.trim()) : (n as number);
  if (!Number.isFinite(v)) throw new Error(`Invalid ${label}`);
  return v;
}

function validateRange(kind: AngleKind, deg: number) {
  const max = DEG_MAX[kind];
  if (deg < -max || deg > max)
    throw new Error(`${kind} degrees out of range: ${deg}`);
}

/** Parse string/number → DD */
export function parseToDD(input: string | number, kind: AngleKind): DD {
  if (
    typeof input === "number" ||
    (typeof input === "string" && /^[+-]?\d+(\.\d+)?$/.test(input.trim()))
  ) {
    const degrees = ensureFinite(input, "decimal degrees");
    validateRange(kind, degrees);
    return { kind, degrees };
  }

  if (typeof input !== "string") throw new Error("Unsupported input type");

  const raw = input.trim().toUpperCase();
  const hemiMatch = raw.match(/\b([NSEW])\b/);
  const hemi = hemiMatch?.[1] as Hemisphere | undefined;
  const nums = raw.match(/[+-]?\d+(?:\.\d+)?/g)?.map(Number) ?? [];

  if (nums.length === 1) {
    let deg = nums[0];
    deg = applyHemiToSign(deg, hemi);
    validateRange(kind, deg);
    return { kind, degrees: deg };
  }

  if (nums.length === 2) {
    const [degPart, minPart] = nums;
    const minutes = Math.abs(minPart);
    if (minutes >= 60) throw new Error("Minutes must be < 60");

    const degAbs = Math.trunc(Math.abs(degPart));
    let sign = Math.sign(degPart) || 1;
    if (hemi) sign = hemi === "S" || hemi === "W" ? -1 : 1;

    const deg = sign * (degAbs + minutes / 60);
    validateRange(kind, deg);
    return { kind, degrees: deg };
  }

  if (nums.length >= 3) {
    const [degPart, minPart, secPart] = nums;
    const minutes = Math.abs(minPart);
    const seconds = Math.abs(secPart);
    if (minutes >= 60) throw new Error("Minutes must be < 60");
    if (seconds >= 60) throw new Error("Seconds must be < 60");

    const degAbs = Math.trunc(Math.abs(degPart));
    let sign = Math.sign(degPart) || 1;
    if (hemi) sign = hemi === "S" || hemi === "W" ? -1 : 1;

    const deg = sign * (degAbs + minutes / 60 + seconds / 3600);
    validateRange(kind, deg);
    return { kind, degrees: deg };
  }

  throw new Error("Unrecognized coordinate format");
}

/** DD → DM */
export function ddToDM(
  dd: DD,
  opts?: { decimals?: number; clamp?: boolean }
): DM {
  const decimals = opts?.decimals ?? 2;
  const degVal = opts?.clamp ? clampDegrees(dd.kind, dd.degrees) : dd.degrees;

  const degInt = Math.trunc(degVal);
  const frac = Math.abs(degVal - degInt);
  let minutes = +(frac * 60).toFixed(decimals);

  if (minutes >= 60) {
    const rolled = degInt >= 0 ? degInt + 1 : degInt - 1;
    return {
      kind: dd.kind,
      degrees: Math.abs(rolled),
      minutes: 0,
      hemi: dirFromSign(dd.kind, rolled),
    };
  }

  return {
    kind: dd.kind,
    degrees: Math.abs(degInt),
    minutes,
    hemi: dirFromSign(dd.kind, degVal),
  };
}

/** DD → DMS */
export function ddToDMS(
  dd: DD,
  opts?: { decimals?: number; clamp?: boolean }
): DMS {
  const decimals = opts?.decimals ?? 2;
  const degVal = opts?.clamp ? clampDegrees(dd.kind, dd.degrees) : dd.degrees;

  const degInt = Math.trunc(degVal);
  const frac = Math.abs(degVal - degInt);
  let minutes = Math.floor(frac * 60);
  let seconds = +(frac * 3600 - minutes * 60).toFixed(decimals);

  let degreesAbs = Math.abs(degInt);

  if (seconds >= 60) {
    seconds = 0;
    minutes += 1;
  }
  if (minutes >= 60) {
    minutes = 0;
    degreesAbs += 1;
  }

  return {
    kind: dd.kind,
    degrees: degreesAbs,
    minutes,
    seconds,
    hemi: dirFromSign(dd.kind, degVal),
  };
}

/** DM → DD */
export function dmToDD(dm: DM): DD {
  if (dm.minutes < 0 || dm.minutes >= 60)
    throw new Error("Minutes must be in [0, 60)");
  const base = Math.abs(dm.degrees) + dm.minutes / 60;
  const signed = applyHemiToSign(dm.degrees < 0 ? -base : base, dm.hemi);
  validateRange(dm.kind, signed);
  return { kind: dm.kind, degrees: signed };
}

/** DMS → DD */
export function dmsToDD(dms: DMS): DD {
  if (dms.minutes < 0 || dms.minutes >= 60)
    throw new Error("Minutes must be in [0, 60)");
  if (dms.seconds < 0 || dms.seconds >= 60)
    throw new Error("Seconds must be in [0, 60)");
  const base = Math.abs(dms.degrees) + dms.minutes / 60 + dms.seconds / 3600;
  const signed = applyHemiToSign(dms.degrees < 0 ? -base : base, dms.hemi);
  validateRange(dms.kind, signed);
  return { kind: dms.kind, degrees: signed };
}

/** Formatters */
export function formatDM(dm: DM, decimals = 2): string {
  const hemi = dm.hemi ?? dirFromSign(dm.kind, dm.degrees);
  return `${Math.abs(dm.degrees)}° ${dm.minutes.toFixed(decimals)}' ${hemi}`;
}

export function formatDMS(dms: DMS, decimals = 2): string {
  const hemi = dms.hemi ?? dirFromSign(dms.kind, dms.degrees);
  return `${Math.abs(dms.degrees)}° ${dms.minutes}' ${dms.seconds.toFixed(
    decimals
  )}" ${hemi}`;
}

export function formatDD(dd: DD, decimals = 5): string {
  const hemi = dirFromSign(dd.kind, dd.degrees);
  return `${Math.abs(dd.degrees).toFixed(decimals)}° ${hemi}`;
}
