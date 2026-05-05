import {
  ensureFinite,
  validateRange,
  applyHemiToSign,
  clampDegrees,
  dirFromSign,
} from "./helpers";
import { DD, DM, DMS } from "../types";
import { CoordinateType, Hemisphere } from "../types";
import { CONVERSION_CONSTANTS, PRECISION_DEFAULTS } from "../data";

// ============================================================================
// BASIC FUNCTIONS - Functions that work with single coordinates
// ============================================================================

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
 * parseToDD("45.123", CoordinateType.LAT)           // { kind: "lat", degrees: 45.123 }
 * parseToDD("45° 7.38' N", CoordinateType.LAT)      // { kind: "lat", degrees: 45.123 }
 * parseToDD("45° 7' 22.8\" N", CoordinateType.LAT)  // { kind: "lat", degrees: 45.123 }
 * parseToDD("-122.4194", CoordinateType.LON)         // { kind: "lon", degrees: -122.4194 }
 * ```
 */
function parseToDD(input: string | number, kind: CoordinateType): DD {
  if (typeof input === "number") {
    const degrees = ensureFinite(input, "decimal degrees");
    validateRange(kind, degrees);
    return { kind, degrees };
  }

  if (typeof input !== "string") throw new Error("Unsupported input type");

  const raw = input.trim().toUpperCase();
  const hemiMatch = raw.match(/\b([NSEW])\b/);
  const hemi = hemiMatch?.[1] as Hemisphere | undefined;
  const nums = raw.match(/[+-]?\d+(?:\.\d+)?/g)?.map(Number) ?? [];

  if (nums.length === 0) throw new Error("Unrecognized coordinate format");

  if (nums.length === 1) {
    // ensureFinite preserves prior semantics for numeric strings that
    // overflow to Infinity (e.g., long all-digit inputs) — without this,
    // they'd reach validateRange and produce a misleading 'out of range'
    // error instead of the original 'Invalid decimal degrees'.
    const value = ensureFinite(nums[0], "decimal degrees");
    const deg = applyHemiToSign(value, hemi);
    validateRange(kind, deg);
    return { kind, degrees: deg };
  }

  // nums.length >= 2: degrees + minutes (+ optional seconds)
  const [degPart, minPart, secPart = 0] = nums;
  if (Math.abs(minPart) >= CONVERSION_CONSTANTS.MINUTES_PER_DEGREE)
    throw new Error("Minutes must be < 60");
  if (nums.length >= 3 && Math.abs(secPart) >= CONVERSION_CONSTANTS.SECONDS_PER_MINUTE)
    throw new Error("Seconds must be < 60");

  const deg = composeFromParts(degPart, minPart, secPart, hemi);
  validateRange(kind, deg);
  return { kind, degrees: deg };
}

function composeFromParts(
  degPart: number,
  minPart: number,
  secPart: number,
  hemi: Hemisphere | undefined
): number {
  const degAbs = Math.trunc(Math.abs(degPart));
  let sign = Math.sign(degPart) || 1;
  if (hemi) sign = hemi === Hemisphere.S || hemi === Hemisphere.W ? -1 : 1;
  return (
    sign *
    (degAbs +
      Math.abs(minPart) / CONVERSION_CONSTANTS.MINUTES_PER_DEGREE +
      Math.abs(secPart) / CONVERSION_CONSTANTS.SECONDS_PER_DEGREE)
  );
}

/**
 * Converts Decimal Degrees (DD) to Degrees-Minutes (DM) format.
 *
 * @param dd - The decimal degrees object to convert
 * @param opts - Optional conversion options
 * @param opts.decimals - Number of decimal places for minutes (default: PRECISION_DEFAULTS.DM_DECIMALS)
 * @param opts.clamp - Whether to clamp degrees to valid ranges (default: false)
 * @returns A DM object with degrees, minutes, and hemisphere
 *
 * @example
 * ```typescript
 * const dd = { kind: CoordinateType.LAT, degrees: 45.123 };
 * const dm = ddToDM(dd);
 * // { kind: "lat", degrees: 45, minutes: 7.38, hemi: "N" }
 *
 * // With custom precision
 * const dmPrecise = ddToDM(dd, { decimals: 4 });
 * // { kind: "lat", degrees: 45, minutes: 7.3800, hemi: "N" }
 * ```
 */
function ddToDM(dd: DD, opts?: { decimals?: number; clamp?: boolean }): DM {
  const { decimals, degVal, degInt, frac } = decomposeDD(
    dd,
    opts,
    PRECISION_DEFAULTS.DM_DECIMALS
  );
  const minutes = +(frac * CONVERSION_CONSTANTS.MINUTES_PER_DEGREE).toFixed(
    decimals
  );

  if (minutes >= CONVERSION_CONSTANTS.MINUTES_PER_DEGREE) {
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
 * @param opts.decimals - Number of decimal places for seconds (default: PRECISION_DEFAULTS.DMS_DECIMALS)
 * @param opts.clamp - Whether to clamp degrees to valid ranges (default: false)
 * @returns A DMS object with degrees, minutes, seconds, and hemisphere
 *
 * @example
 * ```typescript
 * const dd = { kind: CoordinateType.LAT, degrees: 45.123 };
 * const dms = ddToDMS(dd);
 * // { kind: "lat", degrees: 45, minutes: 7, seconds: 22.80, hemi: "N" }
 *
 * // With custom precision
 * const dmsPrecise = ddToDMS(dd, { decimals: 3 });
 * // { kind: "lat", degrees: 45, minutes: 7, seconds: 22.800, hemi: "N" }
 * ```
 */
function ddToDMS(dd: DD, opts?: { decimals?: number; clamp?: boolean }): DMS {
  const { decimals, degVal, degInt, frac } = decomposeDD(
    dd,
    opts,
    PRECISION_DEFAULTS.DMS_DECIMALS
  );
  let minutes = Math.floor(frac * CONVERSION_CONSTANTS.MINUTES_PER_DEGREE);
  let seconds = +(
    frac * CONVERSION_CONSTANTS.SECONDS_PER_DEGREE -
    minutes * CONVERSION_CONSTANTS.SECONDS_PER_MINUTE
  ).toFixed(decimals);

  let degreesAbs = Math.abs(degInt);

  if (seconds >= CONVERSION_CONSTANTS.SECONDS_PER_MINUTE) {
    seconds = 0;
    minutes += 1;
  }
  if (minutes >= CONVERSION_CONSTANTS.MINUTES_PER_DEGREE) {
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

// Shared prelude for ddToDM / ddToDMS — resolve precision, optionally
// clamp, then split degVal into trunc + abs(frac).
function decomposeDD(
  dd: DD,
  opts: { decimals?: number; clamp?: boolean } | undefined,
  defaultDecimals: number
): { decimals: number; degVal: number; degInt: number; frac: number } {
  const decimals = opts?.decimals ?? defaultDecimals;
  const degVal = opts?.clamp ? clampDegrees(dd.kind, dd.degrees) : dd.degrees;
  const degInt = Math.trunc(degVal);
  const frac = Math.abs(degVal - degInt);
  return { decimals, degVal, degInt, frac };
}

/**
 * Converts Degrees-Minutes (DM) format back to Decimal Degrees (DD).
 *
 * @param dm - The degrees-minutes object to convert
 * @returns A DD object with decimal degrees
 *
 * @throws {Error} When minutes are not in [0, 60)
 *
 * @example
 * ```typescript
 * const dm = { kind: CoordinateType.LAT, degrees: 45, minutes: 7.38, hemi: Hemisphere.N };
 * const dd = dmToDD(dm);
 * // { kind: "lat", degrees: 45.123 }
 * ```
 */
function dmToDD(dm: DM): DD {
  if (dm.minutes < 0 || dm.minutes >= CONVERSION_CONSTANTS.MINUTES_PER_DEGREE)
    throw new Error("Minutes must be in [0, 60)");
  const base =
    Math.abs(dm.degrees) + dm.minutes / CONVERSION_CONSTANTS.MINUTES_PER_DEGREE;
  // hemi takes precedence when present; otherwise sign comes from degrees
  const signed = dm.hemi ? applyHemiToSign(base, dm.hemi) : (dm.degrees < 0 ? -base : base);
  validateRange(dm.kind, signed);
  return { kind: dm.kind, degrees: signed };
}

/**
 * Converts Degrees-Minutes-Seconds (DMS) format back to Decimal Degrees (DD).
 *
 * @param dms - The degrees-minutes-seconds object to convert
 * @returns A DD object with decimal degrees
 *
 * @throws {Error} When minutes are not in [0, 60) or seconds are not in [0, 60)
 *
 * @example
 * ```typescript
 * const dms = { kind: CoordinateType.LAT, degrees: 45, minutes: 7, seconds: 22.8, hemi: Hemisphere.N };
 * const dd = dmsToDD(dms);
 * // { kind: "lat", degrees: 45.123 }
 * ```
 */
function dmsToDD(dms: DMS): DD {
  if (dms.minutes < 0 || dms.minutes >= CONVERSION_CONSTANTS.MINUTES_PER_DEGREE)
    throw new Error("Minutes must be in [0, 60)");
  if (dms.seconds < 0 || dms.seconds >= CONVERSION_CONSTANTS.SECONDS_PER_MINUTE)
    throw new Error("Seconds must be in [0, 60)");
  const base =
    Math.abs(dms.degrees) +
    dms.minutes / CONVERSION_CONSTANTS.MINUTES_PER_DEGREE +
    dms.seconds / CONVERSION_CONSTANTS.SECONDS_PER_DEGREE;
  // hemi takes precedence when present; otherwise sign comes from degrees
  const signed = dms.hemi ? applyHemiToSign(base, dms.hemi) : (dms.degrees < 0 ? -base : base);
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
function parsePairToDD(
  latInput: string | number,
  lonInput: string | number
): [DD, DD] {
  return [
    parseToDD(latInput, CoordinateType.LAT),
    parseToDD(lonInput, CoordinateType.LON),
  ];
}

/**
 * Converts a pair of Decimal Degrees (DD) to Degrees-Minutes (DM) format.
 *
 * @param latDD - The latitude DD object
 * @param lonDD - The longitude DD object
 * @param opts - Optional conversion options
 * @param opts.decimals - Number of decimal places for minutes (default: PRECISION_DEFAULTS.DM_DECIMALS)
 * @param opts.clamp - Whether to clamp degrees to valid ranges (default: false)
 * @returns A tuple of DM objects [latitude, longitude]
 *
 * @example
 * ```typescript
 * const latDD = { kind: CoordinateType.LAT, degrees: 48.8544 };
 * const lonDD = { kind: CoordinateType.LON, degrees: -123.5005 };
 * const [latDM, lonDM] = ddPairToDM(latDD, lonDD);
 * // latDM: { kind: "lat", degrees: 48, minutes: 51.26, hemi: "N" }
 * // lonDM: { kind: "lon", degrees: 123, minutes: 30.03, hemi: "W" }
 * ```
 */
function ddPairToDM(
  latDD: DD,
  lonDD: DD,
  opts?: { decimals?: number; clamp?: boolean }
): [DM, DM] {
  return [ddToDM(latDD, opts), ddToDM(lonDD, opts)];
}

/**
 * Converts a pair of Decimal Degrees (DD) to Degrees-Minutes-Seconds (DMS) format.
 *
 * @param latDD - The latitude DD object
 * @param lonDD - The longitude DD object
 * @param opts - Optional conversion options
 * @param opts.decimals - Number of decimal places for seconds (default: PRECISION_DEFAULTS.DMS_DECIMALS)
 * @param opts.clamp - Whether to clamp degrees to valid ranges (default: false)
 * @returns A tuple of DMS objects [latitude, longitude]
 *
 * @example
 * ```typescript
 * const latDD = { kind: CoordinateType.LAT, degrees: 48.8544 };
 * const lonDD = { kind: CoordinateType.LON, degrees: -123.5005 };
 * const [latDMS, lonDMS] = ddPairToDMS(latDD, lonDD);
 * // latDMS: { kind: "lat", degrees: 48, minutes: 51, seconds: 15.84, hemi: "N" }
 * // lonDMS: { kind: "lon", degrees: 123, minutes: 30, seconds: 1.8, hemi: "W" }
 * ```
 */
function ddPairToDMS(
  latDD: DD,
  lonDD: DD,
  opts?: { decimals?: number; clamp?: boolean }
): [DMS, DMS] {
  return [ddToDMS(latDD, opts), ddToDMS(lonDD, opts)];
}

/**
 * Converts a pair of Degrees-Minutes (DM) back to Decimal Degrees (DD) format.
 *
 * @param latDM - The latitude DM object
 * @param lonDM - The longitude DM object
 * @returns A tuple of DD objects [latitude, longitude]
 *
 * @throws {Error} When minutes are not in [0, 60) for either coordinate
 *
 * @example
 * ```typescript
 * const latDM = { kind: CoordinateType.LAT, degrees: 48, minutes: 51.26, hemi: Hemisphere.N };
 * const lonDM = { kind: CoordinateType.LON, degrees: 123, minutes: 30.03, hemi: Hemisphere.W };
 * const [latDD, lonDD] = dmPairToDD(latDM, lonDM);
 * // latDD: { kind: "lat", degrees: 48.8544 }
 * // lonDD: { kind: "lon", degrees: -123.5005 }
 * ```
 */
function dmPairToDD(latDM: DM, lonDM: DM): [DD, DD] {
  return [dmToDD(latDM), dmToDD(lonDM)];
}

/**
 * Converts a pair of Degrees-Minutes-Seconds (DMS) back to Decimal Degrees (DD) format.
 *
 * @param latDMS - The latitude DMS object
 * @param lonDMS - The longitude DMS object
 * @returns A tuple of DD objects [latitude, longitude]
 *
 * @throws {Error} When minutes are not in [0, 60) or seconds are not in [0, 60) for either coordinate
 *
 * @example
 * ```typescript
 * const latDMS = { kind: CoordinateType.LAT, degrees: 48, minutes: 51, seconds: 15.84, hemi: Hemisphere.N };
 * const lonDMS = { kind: CoordinateType.LON, degrees: 123, minutes: 30, seconds: 1.8, hemi: Hemisphere.W };
 * const [latDD, lonDD] = dmsPairToDD(latDMS, lonDMS);
 * // latDD: { kind: "lat", degrees: 48.8544 }
 * // lonDD: { kind: "lon", degrees: -123.5005 }
 * ```
 */
function dmsPairToDD(latDMS: DMS, lonDMS: DMS): [DD, DD] {
  return [dmsToDD(latDMS), dmsToDD(lonDMS)];
}

// Export core functions
export {
  parseToDD,
  ddToDM,
  ddToDMS,
  dmToDD,
  dmsToDD,
  parsePairToDD,
  ddPairToDM,
  ddPairToDMS,
  dmPairToDD,
  dmsPairToDD,
};

// Re-export formatting functions from formatters module
export {
  formatDM,
  formatDMS,
  formatDD,
  formatDMPair,
  formatDMSPair,
  formatDDPair,
} from "./formatters";

// Re-export types from types module
export { CoordinateType, Hemisphere, DD, DM, DMS } from "../types";
