import {
  ensureFinite,
  validateRange,
  applyHemiToSign,
  clampDegrees,
  dirFromSign,
} from "./helpers";
import { AngleKind, Hemisphere, DD, DM, DMS } from "../types";


// ============================================================================
// BASIC FUNCTIONS - Functions that work with single coordinates
// ============================================================================

/**
 * Determines the coordinate type (latitude or longitude) from a hemisphere indicator.
 * 
 * @param hemi - The hemisphere indicator (N, S, E, or W)
 * @returns The corresponding coordinate type - LAT for N/S, LON for E/W
 * 
 * @example
 * ```typescript
 * detectKindFromHemi(Hemisphere.N)  // AngleKind.LAT
 * detectKindFromHemi(Hemisphere.E)  // AngleKind.LON
 * detectKindFromHemi(Hemisphere.S)  // AngleKind.LAT
 * detectKindFromHemi(Hemisphere.W)  // AngleKind.LON
 * ```
 */
export function detectKindFromHemi(hemi: Hemisphere): AngleKind {
  return hemi === Hemisphere.N || hemi === Hemisphere.S
    ? AngleKind.LAT
    : AngleKind.LON;
}

/**
 * Parses various coordinate formats into Decimal Degrees (DD) format.
 * 
 * Supports multiple input formats:
 * - Decimal degrees: `"45.123"`, `45.123`
 * - Degrees-minutes: `"45° 7.38'"`, `"45 7.38 N"`
 * - Degrees-minutes-seconds: `"45° 7' 22.8\" N"`, `"45 7 22.8"`
 * - With hemisphere indicators: `"N"`, `"S"`, `"E"`, `"W"`
 * 
 * @param input - The coordinate string or number to parse
 * @param kind - The coordinate type (latitude or longitude) for validation
 * @returns A DD object with the parsed decimal degrees
 * 
 * @throws {Error} When the input format is unrecognized or values are out of range
 * 
 * @example
 * ```typescript
 * parseToDD("45.123", AngleKind.LAT)           // { kind: "lat", degrees: 45.123 }
 * parseToDD("45° 7.38' N", AngleKind.LAT)      // { kind: "lat", degrees: 45.123 }
 * parseToDD("45° 7' 22.8\" N", AngleKind.LAT)  // { kind: "lat", degrees: 45.123 }
 * parseToDD("-122.4194", AngleKind.LON)         // { kind: "lon", degrees: -122.4194 }
 * ```
 */
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

/**
 * Converts Decimal Degrees (DD) to Degrees-Minutes (DM) format.
 * 
 * @param dd - The decimal degrees object to convert
 * @param opts - Optional conversion options
 * @param opts.decimals - Number of decimal places for minutes (default: 2)
 * @param opts.clamp - Whether to clamp degrees to valid ranges (default: false)
 * @returns A DM object with degrees, minutes, and hemisphere
 * 
 * @example
 * ```typescript
 * const dd = { kind: AngleKind.LAT, degrees: 45.123 };
 * const dm = ddToDM(dd);
 * // { kind: "lat", degrees: 45, minutes: 7.38, hemi: "N" }
 * 
 * // With custom precision
 * const dmPrecise = ddToDM(dd, { decimals: 4 });
 * // { kind: "lat", degrees: 45, minutes: 7.3800, hemi: "N" }
 * ```
 */
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

/**
 * Converts Decimal Degrees (DD) to Degrees-Minutes-Seconds (DMS) format.
 * 
 * @param dd - The decimal degrees object to convert
 * @param opts - Optional conversion options
 * @param opts.decimals - Number of decimal places for seconds (default: 2)
 * @param opts.clamp - Whether to clamp degrees to valid ranges (default: false)
 * @returns A DMS object with degrees, minutes, seconds, and hemisphere
 * 
 * @example
 * ```typescript
 * const dd = { kind: AngleKind.LAT, degrees: 45.123 };
 * const dms = ddToDMS(dd);
 * // { kind: "lat", degrees: 45, minutes: 7, seconds: 22.80, hemi: "N" }
 * 
 * // With custom precision
 * const dmsPrecise = ddToDMS(dd, { decimals: 3 });
 * // { kind: "lat", degrees: 45, minutes: 7, seconds: 22.800, hemi: "N" }
 * ```
 */
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

/**
 * Converts Degrees-Minutes (DM) format back to Decimal Degrees (DD).
 * 
 * @param dm - The degrees-minutes object to convert
 * @returns A DD object with decimal degrees
 * 
 * @throws {Error} When minutes are out of valid range [0, 60)
 * 
 * @example
 * ```typescript
 * const dm = { kind: AngleKind.LAT, degrees: 45, minutes: 7.38, hemi: Hemisphere.N };
 * const dd = dmToDD(dm);
 * // { kind: "lat", degrees: 45.123 }
 * ```
 */
export function dmToDD(dm: DM): DD {
  if (dm.minutes < 0 || dm.minutes >= 60)
    throw new Error("Minutes must be in [0, 60)");
  const base = Math.abs(dm.degrees) + dm.minutes / 60;
  const signed = applyHemiToSign(dm.degrees < 0 ? -base : base, dm.hemi);
  validateRange(dm.kind, signed);
  return { kind: dm.kind, degrees: signed };
}

/**
 * Converts Degrees-Minutes-Seconds (DMS) format back to Decimal Degrees (DD).
 * 
 * @param dms - The degrees-minutes-seconds object to convert
 * @returns A DD object with decimal degrees
 * 
 * @throws {Error} When minutes or seconds are out of valid range [0, 60)
 * 
 * @example
 * ```typescript
 * const dms = { kind: AngleKind.LAT, degrees: 45, minutes: 7, seconds: 22.8, hemi: Hemisphere.N };
 * const dd = dmsToDD(dms);
 * // { kind: "lat", degrees: 45.123 }
 * ```
 */
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


// ============================================================================
// PAIR FUNCTIONS - Functions that work with coordinate pairs
// ============================================================================

/**
 * Parses a pair of coordinate strings/numbers into Decimal Degrees (DD) format.
 * 
 * Accepts latitude and longitude in various formats and returns a pair of DD objects.
 * The first parameter is always treated as latitude, the second as longitude.
 * 
 * @param latInput - The latitude coordinate (string or number)
 * @param lonInput - The longitude coordinate (string or number)
 * @returns A tuple of DD objects [latitude, longitude]
 * 
 * @throws {Error} When either coordinate format is unrecognized or values are out of range
 * 
 * @example
 * ```typescript
 * const [lat, lon] = parsePairToDD("48.8544° N", "123.5005° W");
 * // lat: { kind: "lat", degrees: 48.8544 }
 * // lon: { kind: "lon", degrees: -123.5005 }
 * 
 * const [lat2, lon2] = parsePairToDD(48.8544, -123.5005);
 * // lat2: { kind: "lat", degrees: 48.8544 }
 * // lon2: { kind: "lon", degrees: -123.5005 }
 * ```
 */
export function parsePairToDD(latInput: string | number, lonInput: string | number): [DD, DD] {
  const lat = parseToDD(latInput, AngleKind.LAT);
  const lon = parseToDD(lonInput, AngleKind.LON);
  return [lat, lon];
}

/**
 * Converts a pair of Decimal Degrees (DD) to Degrees-Minutes (DM) format.
 * 
 * @param latDD - The latitude DD object
 * @param lonDD - The longitude DD object
 * @param opts - Optional conversion options
 * @param opts.decimals - Number of decimal places for minutes (default: 2)
 * @param opts.clamp - Whether to clamp degrees to valid ranges (default: false)
 * @returns A tuple of DM objects [latitude, longitude]
 * 
 * @example
 * ```typescript
 * const latDD = { kind: AngleKind.LAT, degrees: 48.8544 };
 * const lonDD = { kind: AngleKind.LON, degrees: -123.5005 };
 * const [latDM, lonDM] = ddPairToDM(latDD, lonDD);
 * // latDM: { kind: "lat", degrees: 48, minutes: 51.26, hemi: "N" }
 * // lonDM: { kind: "lon", degrees: 123, minutes: 30.03, hemi: "W" }
 * ```
 */
export function ddPairToDM(
  latDD: DD, 
  lonDD: DD, 
  opts?: { decimals?: number; clamp?: boolean }
): [DM, DM] {
  const latDM = ddToDM(latDD, opts);
  const lonDM = ddToDM(lonDD, opts);
  return [latDM, lonDM];
}

/**
 * Converts a pair of Decimal Degrees (DD) to Degrees-Minutes-Seconds (DMS) format.
 * 
 * @param latDD - The latitude DD object
 * @param lonDD - The longitude DD object
 * @param opts - Optional conversion options
 * @param opts.decimals - Number of decimal places for seconds (default: 2)
 * @param opts.clamp - Whether to clamp degrees to valid ranges (default: false)
 * @returns A tuple of DMS objects [latitude, longitude]
 * 
 * @example
 * ```typescript
 * const latDD = { kind: AngleKind.LAT, degrees: 48.8544 };
 * const lonDD = { kind: AngleKind.LON, degrees: -123.5005 };
 * const [latDMS, lonDMS] = ddPairToDMS(latDD, lonDD);
 * // latDMS: { kind: "lat", degrees: 48, minutes: 51, seconds: 15.84, hemi: "N" }
 * // lonDMS: { kind: "lon", degrees: 123, minutes: 30, seconds: 1.8, hemi: "W" }
 * ```
 */
export function ddPairToDMS(
  latDD: DD, 
  lonDD: DD, 
  opts?: { decimals?: number; clamp?: boolean }
): [DMS, DMS] {
  const latDMS = ddToDMS(latDD, opts);
  const lonDMS = ddToDMS(lonDD, opts);
  return [latDMS, lonDMS];
}

/**
 * Converts a pair of Degrees-Minutes (DM) back to Decimal Degrees (DD) format.
 * 
 * @param latDM - The latitude DM object
 * @param lonDM - The longitude DM object
 * @returns A tuple of DD objects [latitude, longitude]
 * 
 * @throws {Error} When minutes are out of valid range [0, 60) for either coordinate
 * 
 * @example
 * ```typescript
 * const latDM = { kind: AngleKind.LAT, degrees: 48, minutes: 51.26, hemi: Hemisphere.N };
 * const lonDM = { kind: AngleKind.LON, degrees: 123, minutes: 30.03, hemi: Hemisphere.W };
 * const [latDD, lonDD] = dmPairToDD(latDM, lonDM);
 * // latDD: { kind: "lat", degrees: 48.8544 }
 * // lonDD: { kind: "lon", degrees: -123.5005 }
 * ```
 */
export function dmPairToDD(latDM: DM, lonDM: DM): [DD, DD] {
  const latDD = dmToDD(latDM);
  const lonDD = dmToDD(lonDM);
  return [latDD, lonDD];
}

/**
 * Converts a pair of Degrees-Minutes-Seconds (DMS) back to Decimal Degrees (DD) format.
 * 
 * @param latDMS - The latitude DMS object
 * @param lonDMS - The longitude DMS object
 * @returns A tuple of DD objects [latitude, longitude]
 * 
 * @throws {Error} When minutes or seconds are out of valid range [0, 60) for either coordinate
 * 
 * @example
 * ```typescript
 * const latDMS = { kind: AngleKind.LAT, degrees: 48, minutes: 51, seconds: 15.84, hemi: Hemisphere.N };
 * const lonDMS = { kind: AngleKind.LON, degrees: 123, minutes: 30, seconds: 1.8, hemi: Hemisphere.W };
 * const [latDD, lonDD] = dmsPairToDD(latDMS, lonDMS);
 * // latDD: { kind: "lat", degrees: 48.8544 }
 * // lonDD: { kind: "lon", degrees: -123.5005 }
 * ```
 */
export function dmsPairToDD(latDMS: DMS, lonDMS: DMS): [DD, DD] {
  const latDD = dmsToDD(latDMS);
  const lonDD = dmsToDD(lonDMS);
  return [latDD, lonDD];
}

// Re-export formatting functions from formatters module
export { formatDM, formatDMS, formatDD, formatDMPair, formatDMSPair, formatDDPair } from "./formatters";

