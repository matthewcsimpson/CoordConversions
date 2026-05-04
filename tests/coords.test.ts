import {
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
  formatDDPair,
  formatDMPair,
  formatDMSPair,
} from "../src";
import { formatDM, formatDMS, formatDD } from "../src/formatters";
import { CoordinateType, Hemisphere } from "../types";

const TEST_PRECISION = {
  FLOATING_POINT_TOLERANCE: 5,
};

// ============================================================================
// PARSING TESTS
// ============================================================================

describe("Parsing Functions", () => {
  test("parseToDD - decimal degrees", () => {
    const dd = parseToDD("48.8544", CoordinateType.LAT);
    expect(dd.kind).toBe(CoordinateType.LAT);
    expect(dd.degrees).toBeCloseTo(48.8544, 6);
  });

  test("parseToDD - decimal degrees with hemisphere", () => {
    const lat = parseToDD("48.8544° N", CoordinateType.LAT);
    expect(lat.kind).toBe(CoordinateType.LAT);
    expect(lat.degrees).toBeCloseTo(48.8544, 6);

    const lon = parseToDD("123.5005° W", CoordinateType.LON);
    expect(lon.kind).toBe(CoordinateType.LON);
    expect(lon.degrees).toBeCloseTo(-123.5005, 6);
  });

  test("parseToDD - degrees-minutes format", () => {
    const dd = parseToDD("48° 51.26' N", CoordinateType.LAT);
    expect(dd.kind).toBe(CoordinateType.LAT);
    expect(dd.degrees).toBeCloseTo(48.854333, 5); // Adjusted for floating point precision
  });

  test("parseToDD - degrees-minutes-seconds format", () => {
    const dd = parseToDD("48° 51' 15.84\" N", CoordinateType.LAT);
    expect(dd.kind).toBe(CoordinateType.LAT);
    expect(dd.degrees).toBeCloseTo(48.8544, 6);
  });

  test("parseToDD - negative coordinates", () => {
    const lat = parseToDD("-45.123", CoordinateType.LAT);
    expect(lat.degrees).toBeCloseTo(-45.123, 6);

    const lon = parseToDD("-122.419", CoordinateType.LON);
    expect(lon.degrees).toBeCloseTo(-122.419, 6);
  });

  test("parseToDD - numeric input", () => {
    const dd = parseToDD(48.8544, CoordinateType.LAT);
    expect(dd.kind).toBe(CoordinateType.LAT);
    expect(dd.degrees).toBeCloseTo(48.8544, 6);
  });
});

// ============================================================================
// CONVERSION TESTS
// ============================================================================

describe("Conversion Functions", () => {
  const testLatDD = { kind: CoordinateType.LAT, degrees: 48.8544 };
  const testLonDD = { kind: CoordinateType.LON, degrees: -123.5005 };

  test("ddToDM - basic conversion", () => {
    const dm = ddToDM(testLatDD);
    expect(dm.kind).toBe(CoordinateType.LAT);
    expect(dm.degrees).toBe(48);
    expect(dm.minutes).toBeCloseTo(51.264, 2);
    expect(dm.hemi).toBe(Hemisphere.N);
  });

  test("ddToDM - with options", () => {
    const dm = ddToDM(testLatDD, { decimals: 4 });
    expect(dm.minutes).toBeCloseTo(51.264, 4);
  });

  test("ddToDMS - basic conversion", () => {
    const dms = ddToDMS(testLatDD);
    expect(dms.kind).toBe(CoordinateType.LAT);
    expect(dms.degrees).toBe(48);
    expect(dms.minutes).toBe(51);
    expect(dms.seconds).toBeCloseTo(15.84, 2);
    expect(dms.hemi).toBe(Hemisphere.N);
  });

  test("ddToDMS - with options", () => {
    const dms = ddToDMS(testLatDD, { decimals: 3 });
    expect(dms.seconds).toBeCloseTo(15.84, 3);
  });

  test("dmToDD - basic conversion", () => {
    const dm = {
      kind: CoordinateType.LAT,
      degrees: 48,
      minutes: 51.264,
      hemi: Hemisphere.N,
    };
    const dd = dmToDD(dm);
    expect(dd.kind).toBe(CoordinateType.LAT);
    expect(dd.degrees).toBeCloseTo(48.8544, 6);
  });

  test("dmsToDD - basic conversion", () => {
    const dms = {
      kind: CoordinateType.LAT,
      degrees: 48,
      minutes: 51,
      seconds: 15.84,
      hemi: Hemisphere.N,
    };
    const dd = dmsToDD(dms);
    expect(dd.kind).toBe(CoordinateType.LAT);
    expect(dd.degrees).toBeCloseTo(48.8544, 6);
  });

  test("round trip conversions", () => {
    // DD → DM → DD
    const dm = ddToDM(testLatDD);
    const ddFromDM = dmToDD(dm);
    expect(ddFromDM.degrees).toBeCloseTo(
      testLatDD.degrees,
      TEST_PRECISION.FLOATING_POINT_TOLERANCE
    ); // Sufficient precision for floating point

    // DD → DMS → DD
    const dms = ddToDMS(testLatDD);
    const ddFromDMS = dmsToDD(dms);
    expect(ddFromDMS.degrees).toBeCloseTo(
      testLatDD.degrees,
      TEST_PRECISION.FLOATING_POINT_TOLERANCE
    ); // Sufficient precision for floating point
  });
});

// ============================================================================
// FORMATTING TESTS
// ============================================================================

describe("Formatting Functions", () => {
  const testDD = { kind: CoordinateType.LAT, degrees: 48.8544 };
  const testDM = {
    kind: CoordinateType.LAT,
    degrees: 48,
    minutes: 51.264,
    hemi: Hemisphere.N,
  };
  const testDMS = {
    kind: CoordinateType.LAT,
    degrees: 48,
    minutes: 51,
    seconds: 15.84,
    hemi: Hemisphere.N,
  };

  test("formatDD", () => {
    const formatted = formatDD(testDD);
    expect(formatted).toMatch(/48\.85440° N/);
  });

  test("formatDD - with custom decimals", () => {
    const formatted = formatDD(testDD, 3);
    expect(formatted).toMatch(/48\.854° N/);
  });

  test("formatDM", () => {
    const formatted = formatDM(testDM);
    expect(formatted).toMatch(/48° 51\.26400' N/);
  });

  test("formatDM - with custom decimals", () => {
    const formatted = formatDM(testDM, 4);
    expect(formatted).toMatch(/48° 51\.2640' N/);
  });

  test("formatDMS", () => {
    const formatted = formatDMS(testDMS);
    expect(formatted).toMatch(/48° 51' 15\.84000" N/);
  });

  test("formatDMS - with custom decimals", () => {
    const formatted = formatDMS(testDMS, 3);
    expect(formatted).toMatch(/48° 51' 15\.840" N/);
  });
});

// ============================================================================
// PAIR FUNCTION TESTS
// ============================================================================

describe("Pair Functions", () => {
  test("parsePairToDD", () => {
    const [lat, lon] = parsePairToDD("48.8544° N", "123.5005° W");
    expect(lat.kind).toBe(CoordinateType.LAT);
    expect(lat.degrees).toBeCloseTo(48.8544, 6);
    expect(lon.kind).toBe(CoordinateType.LON);
    expect(lon.degrees).toBeCloseTo(-123.5005, 6);
  });

  test("parsePairToDD - numeric inputs", () => {
    const [lat, lon] = parsePairToDD(48.8544, -123.5005);
    expect(lat.kind).toBe(CoordinateType.LAT);
    expect(lat.degrees).toBeCloseTo(48.8544, 6);
    expect(lon.kind).toBe(CoordinateType.LON);
    expect(lon.degrees).toBeCloseTo(-123.5005, 6);
  });

  test("ddPairToDM", () => {
    const latDD = { kind: CoordinateType.LAT, degrees: 48.8544 };
    const lonDD = { kind: CoordinateType.LON, degrees: -123.5005 };
    const [latDM, lonDM] = ddPairToDM(latDD, lonDD);

    expect(latDM.kind).toBe(CoordinateType.LAT);
    expect(latDM.degrees).toBe(48);
    expect(latDM.minutes).toBeCloseTo(51.264, 2);
    expect(latDM.hemi).toBe(Hemisphere.N);

    expect(lonDM.kind).toBe(CoordinateType.LON);
    expect(lonDM.degrees).toBe(123);
    expect(lonDM.minutes).toBeCloseTo(30.03, 2);
    expect(lonDM.hemi).toBe(Hemisphere.W);
  });

  test("ddPairToDMS", () => {
    const latDD = { kind: CoordinateType.LAT, degrees: 48.8544 };
    const lonDD = { kind: CoordinateType.LON, degrees: -123.5005 };
    const [latDMS, lonDMS] = ddPairToDMS(latDD, lonDD);

    expect(latDMS.kind).toBe(CoordinateType.LAT);
    expect(latDMS.degrees).toBe(48);
    expect(latDMS.minutes).toBe(51);
    expect(latDMS.seconds).toBeCloseTo(15.84, 2);
    expect(latDMS.hemi).toBe(Hemisphere.N);

    expect(lonDMS.kind).toBe(CoordinateType.LON);
    expect(lonDMS.degrees).toBe(123);
    expect(lonDMS.minutes).toBe(30);
    expect(lonDMS.seconds).toBeCloseTo(1.8, 2);
    expect(lonDMS.hemi).toBe(Hemisphere.W);
  });

  test("dmPairToDD", () => {
    const latDM = {
      kind: CoordinateType.LAT,
      degrees: 48,
      minutes: 51.264,
      hemi: Hemisphere.N,
    };
    const lonDM = {
      kind: CoordinateType.LON,
      degrees: 123,
      minutes: 30.03,
      hemi: Hemisphere.W,
    };
    const [latDD, lonDD] = dmPairToDD(latDM, lonDM);

    expect(latDD.kind).toBe(CoordinateType.LAT);
    expect(latDD.degrees).toBeCloseTo(48.8544, 6);

    expect(lonDD.kind).toBe(CoordinateType.LON);
    expect(lonDD.degrees).toBeCloseTo(-123.5005, 6);
  });

  test("dmsPairToDD", () => {
    const latDMS = {
      kind: CoordinateType.LAT,
      degrees: 48,
      minutes: 51,
      seconds: 15.84,
      hemi: Hemisphere.N,
    };
    const lonDMS = {
      kind: CoordinateType.LON,
      degrees: 123,
      minutes: 30,
      seconds: 1.8,
      hemi: Hemisphere.W,
    };
    const [latDD, lonDD] = dmsPairToDD(latDMS, lonDMS);

    expect(latDD.kind).toBe(CoordinateType.LAT);
    expect(latDD.degrees).toBeCloseTo(48.8544, 6);

    expect(lonDD.kind).toBe(CoordinateType.LON);
    expect(lonDD.degrees).toBeCloseTo(-123.5005, 6);
  });

  test("formatDDPair", () => {
    const latDD = { kind: CoordinateType.LAT, degrees: 48.8544 };
    const lonDD = { kind: CoordinateType.LON, degrees: -123.5005 };
    const [latStr, lonStr] = formatDDPair(latDD, lonDD);

    expect(latStr).toMatch(/48\.85440° N/);
    expect(lonStr).toMatch(/123\.50050° W/);
  });

  test("formatDMPair", () => {
    const latDM = {
      kind: CoordinateType.LAT,
      degrees: 48,
      minutes: 51.264,
      hemi: Hemisphere.N,
    };
    const lonDM = {
      kind: CoordinateType.LON,
      degrees: 123,
      minutes: 30.03,
      hemi: Hemisphere.W,
    };
    const [latStr, lonStr] = formatDMPair(latDM, lonDM);

    expect(latStr).toMatch(/48° 51\.26400' N/);
    expect(lonStr).toMatch(/123° 30\.03000' W/);
  });

  test("formatDMSPair", () => {
    const latDMS = {
      kind: CoordinateType.LAT,
      degrees: 48,
      minutes: 51,
      seconds: 15.84,
      hemi: Hemisphere.N,
    };
    const lonDMS = {
      kind: CoordinateType.LON,
      degrees: 123,
      minutes: 30,
      seconds: 1.8,
      hemi: Hemisphere.W,
    };
    const [latStr, lonStr] = formatDMSPair(latDMS, lonDMS);

    expect(latStr).toMatch(/48° 51' 15\.84000" N/);
    expect(lonStr).toMatch(/123° 30' 1\.80000" W/);
  });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe("Error Handling", () => {
  test("parseToDD - invalid format", () => {
    expect(() => parseToDD("invalid format", CoordinateType.LAT)).toThrow(
      "Unrecognized coordinate format"
    );
  });

  test("parseToDD - latitude out of range", () => {
    expect(() => parseToDD("91", CoordinateType.LAT)).toThrow(
      "lat degrees out of range: 91"
    );
    expect(() => parseToDD("-91", CoordinateType.LAT)).toThrow(
      "lat degrees out of range: -91"
    );
  });

  test("parseToDD - longitude out of range", () => {
    expect(() => parseToDD("181", CoordinateType.LON)).toThrow(
      "lon degrees out of range: 181"
    );
    expect(() => parseToDD("-181", CoordinateType.LON)).toThrow(
      "lon degrees out of range: -181"
    );
  });

  test("parseToDD - minutes out of range", () => {
    expect(() => parseToDD("45° 65' N", CoordinateType.LAT)).toThrow(
      "Minutes must be < 60"
    );
  });

  test("parseToDD - seconds out of range", () => {
    expect(() => parseToDD("45° 7' 65\" N", CoordinateType.LAT)).toThrow(
      "Seconds must be < 60"
    );
  });

  test("dmToDD - minutes out of range", () => {
    const dm = {
      kind: CoordinateType.LAT,
      degrees: 45,
      minutes: 65,
      hemi: Hemisphere.N,
    };
    expect(() => dmToDD(dm)).toThrow("Minutes must be in [0, 60)");
  });

  test("dmsToDD - minutes out of range", () => {
    const dms = {
      kind: CoordinateType.LAT,
      degrees: 45,
      minutes: 65,
      seconds: 30,
      hemi: Hemisphere.N,
    };
    expect(() => dmsToDD(dms)).toThrow("Minutes must be in [0, 60)");
  });

  test("dmsToDD - seconds out of range", () => {
    const dms = {
      kind: CoordinateType.LAT,
      degrees: 45,
      minutes: 30,
      seconds: 65,
      hemi: Hemisphere.N,
    };
    expect(() => dmsToDD(dms)).toThrow("Seconds must be in [0, 60)");
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe("Edge Cases", () => {
  test("zero coordinates", () => {
    const dd = parseToDD("0", CoordinateType.LAT);
    expect(dd.degrees).toBe(0);

    const dm = ddToDM(dd);
    expect(dm.degrees).toBe(0);
    expect(dm.minutes).toBe(0);

    const dms = ddToDMS(dd);
    expect(dms.degrees).toBe(0);
    expect(dms.minutes).toBe(0);
    expect(dms.seconds).toBe(0);
  });

  test("boundary values", () => {
    // Maximum latitude
    const maxLat = parseToDD("90", CoordinateType.LAT);
    expect(maxLat.degrees).toBe(90);

    // Minimum latitude
    const minLat = parseToDD("-90", CoordinateType.LAT);
    expect(minLat.degrees).toBe(-90);

    // Maximum longitude
    const maxLon = parseToDD("180", CoordinateType.LON);
    expect(maxLon.degrees).toBe(180);

    // Minimum longitude
    const minLon = parseToDD("-180", CoordinateType.LON);
    expect(minLon.degrees).toBe(-180);
  });

  test("clamping option - ddToDM", () => {
    const invalidLat = { kind: CoordinateType.LAT, degrees: 95 };
    const clampedDM = ddToDM(invalidLat, { clamp: true });
    expect(clampedDM.degrees).toBe(90);
    expect(clampedDM.minutes).toBe(0);
  });

  test("clamping option - ddToDMS", () => {
    const invalidLon = { kind: CoordinateType.LON, degrees: -185 };
    const clampedDMS = ddToDMS(invalidLon, { clamp: true });
    expect(clampedDMS.degrees).toBe(180);
    expect(clampedDMS.minutes).toBe(0);
    expect(clampedDMS.seconds).toBe(0);
    expect(clampedDMS.hemi).toBe(Hemisphere.W);
  });

  test("ddToDM - minutes rollover at default precision", () => {
    // 45.99999999999 has frac near enough to 1 that minutes rounds to 60.00000
    const dd = { kind: CoordinateType.LAT, degrees: 45.99999999999 };
    const dm = ddToDM(dd);
    expect(dm.degrees).toBe(46);
    expect(dm.minutes).toBe(0);
    expect(dm.hemi).toBe(Hemisphere.N);
  });

  test("ddToDM - minutes rollover at decimals=2", () => {
    // 45.99996 → 0.99996 * 60 = 59.9976 → toFixed(2) = "60.00" → rollover
    const dd = { kind: CoordinateType.LAT, degrees: 45.99996 };
    const dm = ddToDM(dd, { decimals: 2 });
    expect(dm.degrees).toBe(46);
    expect(dm.minutes).toBe(0);
    expect(dm.hemi).toBe(Hemisphere.N);
  });

  test("ddToDM - rollover preserves negative sign", () => {
    const dd = { kind: CoordinateType.LON, degrees: -45.99996 };
    const dm = ddToDM(dd, { decimals: 2 });
    expect(dm.degrees).toBe(46);
    expect(dm.minutes).toBe(0);
    expect(dm.hemi).toBe(Hemisphere.W);
  });

  test("ddToDMS - seconds-only rollover (carries into minutes)", () => {
    // 45.5166667 → 30° 60" → 31° 0"
    const dd = { kind: CoordinateType.LAT, degrees: 45.5166667 };
    const dms = ddToDMS(dd, { decimals: 2 });
    expect(dms.degrees).toBe(45);
    expect(dms.minutes).toBe(31);
    expect(dms.seconds).toBe(0);
  });

  test("ddToDMS - cascade rollover (seconds → minutes → degrees)", () => {
    // 45.99999996 → 59° 60" → 60° 0" → 46° 0' 0"
    const dd = { kind: CoordinateType.LAT, degrees: 45.99999996 };
    const dms = ddToDMS(dd, { decimals: 2 });
    expect(dms.degrees).toBe(46);
    expect(dms.minutes).toBe(0);
    expect(dms.seconds).toBe(0);
    expect(dms.hemi).toBe(Hemisphere.N);
  });
});

// ============================================================================
// HEMISPHERE HANDLING — locks in current behavior including the
// hemi-takes-precedence rule for backward compatibility
// ============================================================================

describe("Hemisphere Handling", () => {
  test("dmToDD - hemi overrides signed degrees (hemi wins)", () => {
    // signed degrees says south, hemi says north — hemi wins
    const dm = {
      kind: CoordinateType.LAT,
      degrees: -45,
      minutes: 30,
      hemi: Hemisphere.N,
    };
    const dd = dmToDD(dm);
    expect(dd.degrees).toBeCloseTo(45.5, 6);
  });

  test("dmsToDD - hemi overrides signed degrees", () => {
    const dms = {
      kind: CoordinateType.LON,
      degrees: -120,
      minutes: 30,
      seconds: 30,
      hemi: Hemisphere.E,
    };
    const dd = dmsToDD(dms);
    expect(dd.degrees).toBeGreaterThan(0);
    expect(dd.degrees).toBeCloseTo(120.50833, 5);
  });

  test("dmToDD - signed degrees used when hemi missing", () => {
    const dm = { kind: CoordinateType.LAT, degrees: -45, minutes: 30 };
    const dd = dmToDD(dm);
    expect(dd.degrees).toBeCloseTo(-45.5, 6);
  });

  test("formatDM - falls back to dirFromSign when hemi missing", () => {
    const positiveLat = { kind: CoordinateType.LAT, degrees: 45, minutes: 30 };
    expect(formatDM(positiveLat)).toMatch(/45° 30\.00000' N/);

    const negativeLon = { kind: CoordinateType.LON, degrees: -120, minutes: 15 };
    expect(formatDM(negativeLon)).toMatch(/120° 15\.00000' W/);
  });

  test("formatDMS - falls back to dirFromSign when hemi missing", () => {
    const positiveLat = {
      kind: CoordinateType.LAT,
      degrees: 45,
      minutes: 30,
      seconds: 15,
    };
    expect(formatDMS(positiveLat)).toMatch(/45° 30' 15\.00000" N/);

    const negativeLon = {
      kind: CoordinateType.LON,
      degrees: -120,
      minutes: 15,
      seconds: 30,
    };
    expect(formatDMS(negativeLon)).toMatch(/120° 15' 30\.00000" W/);
  });
});

// ============================================================================
// PARSER QUIRKS — documents existing parseToDD behavior so refactors
// don't drift. Several of these are intentional backward-compat warts.
// ============================================================================

describe("Parser Quirks (backward-compat)", () => {
  test("parseToDD - silently truncates beyond 3 numbers", () => {
    // "1 2 3 4 5" parses as 1° 2' 3" — extras dropped
    const dd = parseToDD("1 2 3 4 5", CoordinateType.LAT);
    expect(dd.degrees).toBeCloseTo(1 + 2 / 60 + 3 / 3600, 6);
  });

  test("parseToDD - silently absolutizes negative min/sec tokens", () => {
    // "45 -7 22 N" treats -7 as +7
    const dd = parseToDD("45 -7 22 N", CoordinateType.LAT);
    expect(dd.degrees).toBeCloseTo(45 + 7 / 60 + 22 / 3600, 6);
  });

  test("parseToDD - hemi takes precedence over signed degrees", () => {
    // "-45 N" — sign says south, hemi says north — hemi wins
    const dd = parseToDD("-45 N", CoordinateType.LAT);
    expect(dd.degrees).toBe(45);
  });

  test("parseToDD - lowercase hemi accepted", () => {
    const dd = parseToDD("45 n", CoordinateType.LAT);
    expect(dd.degrees).toBe(45);
  });

  test("parseToDD - mixed-case hemi accepted", () => {
    const dd = parseToDD('48° 51\' 15.84" s', CoordinateType.LAT);
    expect(dd.degrees).toBeCloseTo(-48.8544, 6);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("Integration Tests", () => {
  test("complete workflow - parse to all formats", () => {
    const [latDD, lonDD] = parsePairToDD("48.8544° N", "123.5005° W");

    // Convert to DM
    const [latDM, lonDM] = ddPairToDM(latDD, lonDD);
    expect(latDM.degrees).toBe(48);
    expect(lonDM.degrees).toBe(123);

    // Convert to DMS
    const [latDMS, lonDMS] = ddPairToDMS(latDD, lonDD);
    expect(latDMS.degrees).toBe(48);
    expect(lonDMS.degrees).toBe(123);

    // Format all
    const [latDDStr, lonDDStr] = formatDDPair(latDD, lonDD);
    const [latDMStr, lonDMStr] = formatDMPair(latDM, lonDM);
    const [latDMSStr, lonDMSStr] = formatDMSPair(latDMS, lonDMS);

    expect(latDDStr).toMatch(/48\.85440° N/);
    expect(lonDDStr).toMatch(/123\.50050° W/);
    expect(latDMStr).toMatch(/48° 51\.26400' N/);
    expect(lonDMStr).toMatch(/123° 30\.03000' W/);
    expect(latDMSStr).toMatch(/48° 51' 15\.84000" N/);
    expect(lonDMSStr).toMatch(/123° 30' 1\.80000" W/);
  });

  test("round trip accuracy", () => {
    const originalLat = 48.8544;
    const originalLon = -123.5005;

    const [latDD, lonDD] = parsePairToDD(originalLat, originalLon);
    const [latDM, lonDM] = ddPairToDM(latDD, lonDD);
    const [latDMS, lonDMS] = ddPairToDMS(latDD, lonDD);

    // Round trip through DM
    const [latDD2, lonDD2] = dmPairToDD(latDM, lonDM);
    expect(latDD2.degrees).toBeCloseTo(
      originalLat,
      TEST_PRECISION.FLOATING_POINT_TOLERANCE
    ); // Sufficient precision for floating point
    expect(lonDD2.degrees).toBeCloseTo(
      originalLon,
      TEST_PRECISION.FLOATING_POINT_TOLERANCE
    ); // Sufficient precision for floating point

    // Round trip through DMS
    const [latDD3, lonDD3] = dmsPairToDD(latDMS, lonDMS);
    expect(latDD3.degrees).toBeCloseTo(
      originalLat,
      TEST_PRECISION.FLOATING_POINT_TOLERANCE
    ); // Sufficient precision for floating point
    expect(lonDD3.degrees).toBeCloseTo(
      originalLon,
      TEST_PRECISION.FLOATING_POINT_TOLERANCE
    ); // Sufficient precision for floating point
  });
});
