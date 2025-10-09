import { DM, DMS, DD } from "../types";
import { dirFromSign } from "./helpers";
import { PRECISION_DEFAULTS } from "../data";

/**
 * Formats a Degrees-Minutes (DM) object as a human-readable string.
 *
 * @param dm - The DM object to format
 * @param decimals - Number of decimal places for minutes (default: PRECISION_DEFAULTS.DM_DECIMALS)
 * @returns A formatted string like "45° 7.38' N"
 *
 * @example
 * ```typescript
 * const dm = { kind: CoordinateType.LAT, degrees: 45, minutes: 7.38, hemi: Hemisphere.N };
 * formatDM(dm);        // "45° 7.38' N"
 * formatDM(dm, 4);     // "45° 7.3800' N"
 * ```
 */
export function formatDM(dm: DM, decimals = PRECISION_DEFAULTS.DM_DECIMALS): string {
  const hemi = dm.hemi ?? dirFromSign(dm.kind, dm.degrees);
  return `${Math.abs(dm.degrees)}° ${dm.minutes.toFixed(decimals)}' ${hemi}`;
}

/**
 * Formats a Degrees-Minutes-Seconds (DMS) object as a human-readable string.
 *
 * @param dms - The DMS object to format
 * @param decimals - Number of decimal places for seconds (default: PRECISION_DEFAULTS.DMS_DECIMALS)
 * @returns A formatted string like "45° 7' 22.80\" N"
 *
 * @example
 * ```typescript
 * const dms = { kind: CoordinateType.LAT, degrees: 45, minutes: 7, seconds: 22.8, hemi: Hemisphere.N };
 * formatDMS(dms);      // "45° 7' 22.80\" N"
 * formatDMS(dms, 3);   // "45° 7' 22.800\" N"
 * ```
 */
export function formatDMS(dms: DMS, decimals = PRECISION_DEFAULTS.DMS_DECIMALS): string {
  const hemi = dms.hemi ?? dirFromSign(dms.kind, dms.degrees);
  return `${Math.abs(dms.degrees)}° ${dms.minutes}' ${dms.seconds.toFixed(
    decimals
  )}" ${hemi}`;
}

/**
 * Formats a Decimal Degrees (DD) object as a human-readable string.
 *
 * @param dd - The DD object to format
 * @param decimals - Number of decimal places for degrees (default: PRECISION_DEFAULTS.DD_DECIMALS)
 * @returns A formatted string like "45.12300° N"
 *
 * @example
 * ```typescript
 * const dd = { kind: CoordinateType.LAT, degrees: 45.123 };
 * formatDD(dd);        // "45.12300° N"
 * formatDD(dd, 3);    // "45.123° N"
 * ```
 */
export function formatDD(dd: DD, decimals = PRECISION_DEFAULTS.DD_DECIMALS): string {
  const hemi = dirFromSign(dd.kind, dd.degrees);
  return `${Math.abs(dd.degrees).toFixed(decimals)}° ${hemi}`;
}

/**
 * Formats a pair of Degrees-Minutes (DM) objects as human-readable strings.
 *
 * @param latDM - The latitude DM object
 * @param lonDM - The longitude DM object
 * @param decimals - Number of decimal places for minutes (default: PRECISION_DEFAULTS.DM_DECIMALS)
 * @returns A tuple of formatted strings [latitude, longitude]
 *
 * @example
 * ```typescript
 * const latDM = { kind: CoordinateType.LAT, degrees: 48, minutes: 51.26, hemi: Hemisphere.N };
 * const lonDM = { kind: CoordinateType.LON, degrees: 123, minutes: 30.03, hemi: Hemisphere.W };
 * const [latStr, lonStr] = formatDMPair(latDM, lonDM);
 * // latStr: "48° 51.26' N"
 * // lonStr: "123° 30.03' W"
 * ```
 */
export function formatDMPair(
  latDM: DM,
  lonDM: DM,
  decimals = PRECISION_DEFAULTS.DM_DECIMALS
): [string, string] {
  const latStr = formatDM(latDM, decimals);
  const lonStr = formatDM(lonDM, decimals);
  return [latStr, lonStr];
}

/**
 * Formats a pair of Degrees-Minutes-Seconds (DMS) objects as human-readable strings.
 *
 * @param latDMS - The latitude DMS object
 * @param lonDMS - The longitude DMS object
 * @param decimals - Number of decimal places for seconds (default: PRECISION_DEFAULTS.DMS_DECIMALS)
 * @returns A tuple of formatted strings [latitude, longitude]
 *
 * @example
 * ```typescript
 * const latDMS = { kind: CoordinateType.LAT, degrees: 48, minutes: 51, seconds: 15.84, hemi: Hemisphere.N };
 * const lonDMS = { kind: CoordinateType.LON, degrees: 123, minutes: 30, seconds: 1.8, hemi: Hemisphere.W };
 * const [latStr, lonStr] = formatDMSPair(latDMS, lonDMS);
 * // latStr: "48° 51' 15.84" N"
 * // lonStr: "123° 30' 1.80" W"
 * ```
 */
export function formatDMSPair(
  latDMS: DMS,
  lonDMS: DMS,
  decimals = PRECISION_DEFAULTS.DMS_DECIMALS
): [string, string] {
  const latStr = formatDMS(latDMS, decimals);
  const lonStr = formatDMS(lonDMS, decimals);
  return [latStr, lonStr];
}

/**
 * Formats a pair of Decimal Degrees (DD) objects as human-readable strings.
 *
 * @param latDD - The latitude DD object
 * @param lonDD - The longitude DD object
 * @param decimals - Number of decimal places for degrees (default: PRECISION_DEFAULTS.DD_DECIMALS)
 * @returns A tuple of formatted strings [latitude, longitude]
 *
 * @example
 * ```typescript
 * const latDD = { kind: CoordinateType.LAT, degrees: 48.8544 };
 * const lonDD = { kind: CoordinateType.LON, degrees: -123.5005 };
 * const [latStr, lonStr] = formatDDPair(latDD, lonDD);
 * // latStr: "48.85440° N"
 * // lonStr: "123.50050° W"
 * ```
 */
export function formatDDPair(
  latDD: DD,
  lonDD: DD,
  decimals = PRECISION_DEFAULTS.DD_DECIMALS
): [string, string] {
  const latStr = formatDD(latDD, decimals);
  const lonStr = formatDD(lonDD, decimals);
  return [latStr, lonStr];
}
