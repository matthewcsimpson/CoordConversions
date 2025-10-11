import { CoordinateType, Hemisphere } from "../types";
import { DEG_MAX } from "../data";

/**
 * Determines the hemisphere indicator based on coordinate type and sign.
 *
 * @param kind - The coordinate type (latitude or longitude)
 * @param value - The numeric value (positive or negative)
 * @returns The appropriate hemisphere indicator
 *   - For latitude: N for positive values, S for negative values
 *   - For longitude: E for positive values, W for negative values
 *
 * @example
 * ```typescript
 * dirFromSign(CoordinateType.LAT, 45.123)   // Hemisphere.N
 * dirFromSign(CoordinateType.LAT, -45.123)  // Hemisphere.S
 * dirFromSign(CoordinateType.LON, 122.419)  // Hemisphere.E
 * dirFromSign(CoordinateType.LON, -122.419) // Hemisphere.W
 * ```
 */
function dirFromSign(kind: CoordinateType, value: number): Hemisphere {
  if (kind === CoordinateType.LAT)
    return value >= 0 ? Hemisphere.N : Hemisphere.S;
  return value >= 0 ? Hemisphere.E : Hemisphere.W;
}

/**
 * Applies hemisphere indicator to a numeric value, ensuring correct sign.
 *
 * If a hemisphere is provided, the value is converted to its absolute value
 * and the sign is determined by the hemisphere (S/W = negative, N/E = positive).
 *
 * @param value - The numeric value to process
 * @param hemi - Optional hemisphere indicator (N, S, E, W)
 * @returns The value with correct sign based on hemisphere, or original value if no hemisphere provided
 *
 * @example
 * ```typescript
 * applyHemiToSign(45.123, Hemisphere.N)  // 45.123
 * applyHemiToSign(45.123, Hemisphere.S)  // -45.123
 * applyHemiToSign(45.123, Hemisphere.E)  // 45.123
 * applyHemiToSign(45.123, Hemisphere.W)  // -45.123
 * applyHemiToSign(45.123)                // 45.123 (no hemisphere)
 * ```
 */
function applyHemiToSign(value: number, hemi?: Hemisphere): number {
  if (!hemi) return value;
  if (hemi === Hemisphere.S || hemi === Hemisphere.W) return -Math.abs(value);
  return Math.abs(value);
}

/**
 * Clamps degree values to valid ranges for the given coordinate type.
 *
 * Ensures that latitude values are within [-90°, +90°] and longitude values
 * are within [-180°, +180°]. Values outside these ranges are clamped to the nearest valid value.
 *
 * @param kind - The coordinate type (latitude or longitude)
 * @param deg - The degree value to clamp
 * @returns The clamped degree value within valid range
 *
 * @example
 * ```typescript
 * clampDegrees(CoordinateType.LAT, 95)   // 90 (clamped to max latitude)
 * clampDegrees(CoordinateType.LAT, -95)  // -90 (clamped to min latitude)
 * clampDegrees(CoordinateType.LON, 185)  // 180 (clamped to max longitude)
 * clampDegrees(CoordinateType.LON, -185) // -180 (clamped to min longitude)
 * clampDegrees(CoordinateType.LAT, 45)   // 45 (already valid)
 * ```
 */
function clampDegrees(kind: CoordinateType, deg: number): number {
  const max = DEG_MAX[kind];
  if (deg > max) return max;
  if (deg < -max) return -max;
  return deg;
}

/**
 * Ensures that a value is a finite number, converting from string if necessary.
 *
 * This utility function validates that input values are valid numbers.
 * It can convert string representations of numbers to numeric values.
 *
 * @param n - The value to validate (string or number)
 * @param label - Optional label for error messages (default: "number")
 * @returns The validated finite number
 *
 * @throws {Error} When the value cannot be converted to a finite number
 *
 * @example
 * ```typescript
 * ensureFinite(45.123)           // 45.123
 * ensureFinite("45.123")         // 45.123
 * ensureFinite("45.123", "lat")  // 45.123
 * ensureFinite("invalid")        // throws Error: Invalid number
 * ensureFinite(NaN)              // throws Error: Invalid number
 * ensureFinite(Infinity)         // throws Error: Invalid number
 * ```
 */
function ensureFinite(n: unknown, label = "number"): number {
  const v = typeof n === "string" ? Number(n.trim()) : (n as number);
  if (!Number.isFinite(v)) throw new Error(`Invalid ${label}`);
  return v;
}

/**
 * Validates that degree values are within valid ranges for the given coordinate type.
 *
 * Checks that latitude values are within [-90°, +90°] and longitude values
 * are within [-180°, +180°]. Throws an error if values are outside these ranges.
 *
 * @param kind - The coordinate type (latitude or longitude)
 * @param deg - The degree value to validate
 *
 * @throws {Error} When the degree value is outside the valid range for the coordinate type
 *
 * @example
 * ```typescript
 * validateRange(CoordinateType.LAT, 45)   // OK (valid latitude)
 * validateRange(CoordinateType.LON, 122)   // OK (valid longitude)
 * validateRange(CoordinateType.LAT, 95)    // throws Error: lat degrees out of range: 95
 * validateRange(CoordinateType.LON, 185)    // throws Error: lon degrees out of range: 185
 * ```
 */
function validateRange(kind: CoordinateType, deg: number) {
  const max = DEG_MAX[kind];
  if (deg < -max || deg > max)
    throw new Error(`${kind} degrees out of range: ${deg}`);
}

// Export helper functions for internal use by other modules
export {
  dirFromSign,
  applyHemiToSign,
  clampDegrees,
  ensureFinite,
  validateRange,
};
