import { 
  parseToDD, 
  ddToDM, 
  ddToDMS, 
  dmToDD, 
  dmsToDD, 
  detectKindFromHemi,
  parsePairToDD,
  ddPairToDM,
  ddPairToDMS,
  dmPairToDD,
  dmsPairToDD,
  formatDDPair,
  formatDMPair,
  formatDMSPair
} from '../src';
import { formatDM, formatDMS, formatDD } from '../src/formatters';
import { AngleKind, Hemisphere } from "../types";
import { TEST_PRECISION } from "../data";

// ============================================================================
// PARSING TESTS
// ============================================================================

describe('Parsing Functions', () => {
  test('parseToDD - decimal degrees', () => {
    const dd = parseToDD('48.8544', AngleKind.LAT);
    expect(dd.kind).toBe(AngleKind.LAT);
    expect(dd.degrees).toBeCloseTo(48.8544, 6);
  });

  test('parseToDD - decimal degrees with hemisphere', () => {
    const lat = parseToDD('48.8544° N', AngleKind.LAT);
    expect(lat.kind).toBe(AngleKind.LAT);
    expect(lat.degrees).toBeCloseTo(48.8544, 6);

    const lon = parseToDD('123.5005° W', AngleKind.LON);
    expect(lon.kind).toBe(AngleKind.LON);
    expect(lon.degrees).toBeCloseTo(-123.5005, 6);
  });

  test('parseToDD - degrees-minutes format', () => {
    const dd = parseToDD('48° 51.26\' N', AngleKind.LAT);
    expect(dd.kind).toBe(AngleKind.LAT);
    expect(dd.degrees).toBeCloseTo(48.854333, 5); // Adjusted for floating point precision
  });

  test('parseToDD - degrees-minutes-seconds format', () => {
    const dd = parseToDD('48° 51\' 15.84" N', AngleKind.LAT);
    expect(dd.kind).toBe(AngleKind.LAT);
    expect(dd.degrees).toBeCloseTo(48.8544, 6);
  });

  test('parseToDD - negative coordinates', () => {
    const lat = parseToDD('-45.123', AngleKind.LAT);
    expect(lat.degrees).toBeCloseTo(-45.123, 6);

    const lon = parseToDD('-122.419', AngleKind.LON);
    expect(lon.degrees).toBeCloseTo(-122.419, 6);
  });

  test('parseToDD - numeric input', () => {
    const dd = parseToDD(48.8544, AngleKind.LAT);
    expect(dd.kind).toBe(AngleKind.LAT);
    expect(dd.degrees).toBeCloseTo(48.8544, 6);
  });

  test('detectKindFromHemi', () => {
    expect(detectKindFromHemi(Hemisphere.N)).toBe(AngleKind.LAT);
    expect(detectKindFromHemi(Hemisphere.S)).toBe(AngleKind.LAT);
    expect(detectKindFromHemi(Hemisphere.E)).toBe(AngleKind.LON);
    expect(detectKindFromHemi(Hemisphere.W)).toBe(AngleKind.LON);
  });
});

// ============================================================================
// CONVERSION TESTS
// ============================================================================

describe('Conversion Functions', () => {
  const testLatDD = { kind: AngleKind.LAT, degrees: 48.8544 };
  const testLonDD = { kind: AngleKind.LON, degrees: -123.5005 };

  test('ddToDM - basic conversion', () => {
    const dm = ddToDM(testLatDD);
    expect(dm.kind).toBe(AngleKind.LAT);
    expect(dm.degrees).toBe(48);
    expect(dm.minutes).toBeCloseTo(51.264, 2);
    expect(dm.hemi).toBe(Hemisphere.N);
  });

  test('ddToDM - with options', () => {
    const dm = ddToDM(testLatDD, { decimals: 4 });
    expect(dm.minutes).toBeCloseTo(51.264, 4);
  });

  test('ddToDMS - basic conversion', () => {
    const dms = ddToDMS(testLatDD);
    expect(dms.kind).toBe(AngleKind.LAT);
    expect(dms.degrees).toBe(48);
    expect(dms.minutes).toBe(51);
    expect(dms.seconds).toBeCloseTo(15.84, 2);
    expect(dms.hemi).toBe(Hemisphere.N);
  });

  test('ddToDMS - with options', () => {
    const dms = ddToDMS(testLatDD, { decimals: 3 });
    expect(dms.seconds).toBeCloseTo(15.840, 3);
  });

  test('dmToDD - basic conversion', () => {
    const dm = { kind: AngleKind.LAT, degrees: 48, minutes: 51.264, hemi: Hemisphere.N };
    const dd = dmToDD(dm);
    expect(dd.kind).toBe(AngleKind.LAT);
    expect(dd.degrees).toBeCloseTo(48.8544, 6);
  });

  test('dmsToDD - basic conversion', () => {
    const dms = { kind: AngleKind.LAT, degrees: 48, minutes: 51, seconds: 15.84, hemi: Hemisphere.N };
    const dd = dmsToDD(dms);
    expect(dd.kind).toBe(AngleKind.LAT);
    expect(dd.degrees).toBeCloseTo(48.8544, 6);
  });

  test('round trip conversions', () => {
    // DD → DM → DD
    const dm = ddToDM(testLatDD);
    const ddFromDM = dmToDD(dm);
    expect(ddFromDM.degrees).toBeCloseTo(testLatDD.degrees, TEST_PRECISION.FLOATING_POINT_TOLERANCE); // Sufficient precision for floating point

    // DD → DMS → DD
    const dms = ddToDMS(testLatDD);
    const ddFromDMS = dmsToDD(dms);
    expect(ddFromDMS.degrees).toBeCloseTo(testLatDD.degrees, TEST_PRECISION.FLOATING_POINT_TOLERANCE); // Sufficient precision for floating point
  });
});

// ============================================================================
// FORMATTING TESTS
// ============================================================================

describe('Formatting Functions', () => {
  const testDD = { kind: AngleKind.LAT, degrees: 48.8544 };
  const testDM = { kind: AngleKind.LAT, degrees: 48, minutes: 51.264, hemi: Hemisphere.N };
  const testDMS = { kind: AngleKind.LAT, degrees: 48, minutes: 51, seconds: 15.84, hemi: Hemisphere.N };

  test('formatDD', () => {
    const formatted = formatDD(testDD);
    expect(formatted).toMatch(/48\.85440° N/);
  });

  test('formatDD - with custom decimals', () => {
    const formatted = formatDD(testDD, 3);
    expect(formatted).toMatch(/48\.854° N/);
  });

  test('formatDM', () => {
    const formatted = formatDM(testDM);
    expect(formatted).toMatch(/48° 51\.26' N/);
  });

  test('formatDM - with custom decimals', () => {
    const formatted = formatDM(testDM, 4);
    expect(formatted).toMatch(/48° 51\.2640' N/);
  });

  test('formatDMS', () => {
    const formatted = formatDMS(testDMS);
    expect(formatted).toMatch(/48° 51' 15\.84" N/);
  });

  test('formatDMS - with custom decimals', () => {
    const formatted = formatDMS(testDMS, 3);
    expect(formatted).toMatch(/48° 51' 15\.840" N/);
  });
});

// ============================================================================
// PAIR FUNCTION TESTS
// ============================================================================

describe('Pair Functions', () => {
  test('parsePairToDD', () => {
    const [lat, lon] = parsePairToDD('48.8544° N', '123.5005° W');
    expect(lat.kind).toBe(AngleKind.LAT);
    expect(lat.degrees).toBeCloseTo(48.8544, 6);
    expect(lon.kind).toBe(AngleKind.LON);
    expect(lon.degrees).toBeCloseTo(-123.5005, 6);
  });

  test('parsePairToDD - numeric inputs', () => {
    const [lat, lon] = parsePairToDD(48.8544, -123.5005);
    expect(lat.kind).toBe(AngleKind.LAT);
    expect(lat.degrees).toBeCloseTo(48.8544, 6);
    expect(lon.kind).toBe(AngleKind.LON);
    expect(lon.degrees).toBeCloseTo(-123.5005, 6);
  });

  test('ddPairToDM', () => {
    const latDD = { kind: AngleKind.LAT, degrees: 48.8544 };
    const lonDD = { kind: AngleKind.LON, degrees: -123.5005 };
    const [latDM, lonDM] = ddPairToDM(latDD, lonDD);

    expect(latDM.kind).toBe(AngleKind.LAT);
    expect(latDM.degrees).toBe(48);
    expect(latDM.minutes).toBeCloseTo(51.264, 2);
    expect(latDM.hemi).toBe(Hemisphere.N);

    expect(lonDM.kind).toBe(AngleKind.LON);
    expect(lonDM.degrees).toBe(123);
    expect(lonDM.minutes).toBeCloseTo(30.03, 2);
    expect(lonDM.hemi).toBe(Hemisphere.W);
  });

  test('ddPairToDMS', () => {
    const latDD = { kind: AngleKind.LAT, degrees: 48.8544 };
    const lonDD = { kind: AngleKind.LON, degrees: -123.5005 };
    const [latDMS, lonDMS] = ddPairToDMS(latDD, lonDD);

    expect(latDMS.kind).toBe(AngleKind.LAT);
    expect(latDMS.degrees).toBe(48);
    expect(latDMS.minutes).toBe(51);
    expect(latDMS.seconds).toBeCloseTo(15.84, 2);
    expect(latDMS.hemi).toBe(Hemisphere.N);

    expect(lonDMS.kind).toBe(AngleKind.LON);
    expect(lonDMS.degrees).toBe(123);
    expect(lonDMS.minutes).toBe(30);
    expect(lonDMS.seconds).toBeCloseTo(1.8, 2);
    expect(lonDMS.hemi).toBe(Hemisphere.W);
  });

  test('dmPairToDD', () => {
    const latDM = { kind: AngleKind.LAT, degrees: 48, minutes: 51.264, hemi: Hemisphere.N };
    const lonDM = { kind: AngleKind.LON, degrees: 123, minutes: 30.03, hemi: Hemisphere.W };
    const [latDD, lonDD] = dmPairToDD(latDM, lonDM);

    expect(latDD.kind).toBe(AngleKind.LAT);
    expect(latDD.degrees).toBeCloseTo(48.8544, 6);

    expect(lonDD.kind).toBe(AngleKind.LON);
    expect(lonDD.degrees).toBeCloseTo(-123.5005, 6);
  });

  test('dmsPairToDD', () => {
    const latDMS = { kind: AngleKind.LAT, degrees: 48, minutes: 51, seconds: 15.84, hemi: Hemisphere.N };
    const lonDMS = { kind: AngleKind.LON, degrees: 123, minutes: 30, seconds: 1.8, hemi: Hemisphere.W };
    const [latDD, lonDD] = dmsPairToDD(latDMS, lonDMS);

    expect(latDD.kind).toBe(AngleKind.LAT);
    expect(latDD.degrees).toBeCloseTo(48.8544, 6);

    expect(lonDD.kind).toBe(AngleKind.LON);
    expect(lonDD.degrees).toBeCloseTo(-123.5005, 6);
  });

  test('formatDDPair', () => {
    const latDD = { kind: AngleKind.LAT, degrees: 48.8544 };
    const lonDD = { kind: AngleKind.LON, degrees: -123.5005 };
    const [latStr, lonStr] = formatDDPair(latDD, lonDD);

    expect(latStr).toMatch(/48\.85440° N/);
    expect(lonStr).toMatch(/123\.50050° W/);
  });

  test('formatDMPair', () => {
    const latDM = { kind: AngleKind.LAT, degrees: 48, minutes: 51.264, hemi: Hemisphere.N };
    const lonDM = { kind: AngleKind.LON, degrees: 123, minutes: 30.03, hemi: Hemisphere.W };
    const [latStr, lonStr] = formatDMPair(latDM, lonDM);

    expect(latStr).toMatch(/48° 51\.26' N/);
    expect(lonStr).toMatch(/123° 30\.03' W/);
  });

  test('formatDMSPair', () => {
    const latDMS = { kind: AngleKind.LAT, degrees: 48, minutes: 51, seconds: 15.84, hemi: Hemisphere.N };
    const lonDMS = { kind: AngleKind.LON, degrees: 123, minutes: 30, seconds: 1.8, hemi: Hemisphere.W };
    const [latStr, lonStr] = formatDMSPair(latDMS, lonDMS);

    expect(latStr).toMatch(/48° 51' 15\.84" N/);
    expect(lonStr).toMatch(/123° 30' 1\.80" W/);
  });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe('Error Handling', () => {
  test('parseToDD - invalid format', () => {
    expect(() => parseToDD('invalid format', AngleKind.LAT)).toThrow('Unrecognized coordinate format');
  });

  test('parseToDD - latitude out of range', () => {
    expect(() => parseToDD('91', AngleKind.LAT)).toThrow('lat degrees out of range: 91');
    expect(() => parseToDD('-91', AngleKind.LAT)).toThrow('lat degrees out of range: -91');
  });

  test('parseToDD - longitude out of range', () => {
    expect(() => parseToDD('181', AngleKind.LON)).toThrow('lon degrees out of range: 181');
    expect(() => parseToDD('-181', AngleKind.LON)).toThrow('lon degrees out of range: -181');
  });

  test('parseToDD - minutes out of range', () => {
    expect(() => parseToDD('45° 65\' N', AngleKind.LAT)).toThrow('Minutes must be < 60');
  });

  test('parseToDD - seconds out of range', () => {
    expect(() => parseToDD('45° 7\' 65" N', AngleKind.LAT)).toThrow('Seconds must be < 60');
  });

  test('dmToDD - minutes out of range', () => {
    const dm = { kind: AngleKind.LAT, degrees: 45, minutes: 65, hemi: Hemisphere.N };
    expect(() => dmToDD(dm)).toThrow('Minutes must be in [0, 60)');
  });

  test('dmsToDD - minutes out of range', () => {
    const dms = { kind: AngleKind.LAT, degrees: 45, minutes: 65, seconds: 30, hemi: Hemisphere.N };
    expect(() => dmsToDD(dms)).toThrow('Minutes must be in [0, 60)');
  });

  test('dmsToDD - seconds out of range', () => {
    const dms = { kind: AngleKind.LAT, degrees: 45, minutes: 30, seconds: 65, hemi: Hemisphere.N };
    expect(() => dmsToDD(dms)).toThrow('Seconds must be in [0, 60)');
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Edge Cases', () => {
  test('zero coordinates', () => {
    const dd = parseToDD('0', AngleKind.LAT);
    expect(dd.degrees).toBe(0);

    const dm = ddToDM(dd);
    expect(dm.degrees).toBe(0);
    expect(dm.minutes).toBe(0);

    const dms = ddToDMS(dd);
    expect(dms.degrees).toBe(0);
    expect(dms.minutes).toBe(0);
    expect(dms.seconds).toBe(0);
  });

  test('boundary values', () => {
    // Maximum latitude
    const maxLat = parseToDD('90', AngleKind.LAT);
    expect(maxLat.degrees).toBe(90);

    // Minimum latitude
    const minLat = parseToDD('-90', AngleKind.LAT);
    expect(minLat.degrees).toBe(-90);

    // Maximum longitude
    const maxLon = parseToDD('180', AngleKind.LON);
    expect(maxLon.degrees).toBe(180);

    // Minimum longitude
    const minLon = parseToDD('-180', AngleKind.LON);
    expect(minLon.degrees).toBe(-180);
  });

  test('clamping option', () => {
    const invalidLat = { kind: AngleKind.LAT, degrees: 95 };
    const clampedDM = ddToDM(invalidLat, { clamp: true });
    expect(clampedDM.degrees).toBe(90);
    expect(clampedDM.minutes).toBe(0);
  });

  test('minutes rollover', () => {
    const dd = { kind: AngleKind.LAT, degrees: 45.999 };
    const dm = ddToDM(dd);
    // The actual behavior: 45.999 becomes 45° 59.94' (not 46° 0')
    expect(dm.degrees).toBe(45);
    expect(dm.minutes).toBeCloseTo(59.94, 2);
  });

  test('seconds rollover', () => {
    const dd = { kind: AngleKind.LAT, degrees: 45.9999 };
    const dms = ddToDMS(dd);
    // The actual behavior: 45.9999 becomes 45° 59' 59.64" (not 46° 0' 0")
    expect(dms.degrees).toBe(45);
    expect(dms.minutes).toBe(59);
    expect(dms.seconds).toBeCloseTo(59.64, 2);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration Tests', () => {
  test('complete workflow - parse to all formats', () => {
    const [latDD, lonDD] = parsePairToDD('48.8544° N', '123.5005° W');
    
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
    expect(latDMStr).toMatch(/48° 51\.26' N/);
    expect(lonDMStr).toMatch(/123° 30\.03' W/);
    expect(latDMSStr).toMatch(/48° 51' 15\.84" N/);
    expect(lonDMSStr).toMatch(/123° 30' 1\.80" W/);
  });

  test('round trip accuracy', () => {
    const originalLat = 48.8544;
    const originalLon = -123.5005;
    
    const [latDD, lonDD] = parsePairToDD(originalLat, originalLon);
    const [latDM, lonDM] = ddPairToDM(latDD, lonDD);
    const [latDMS, lonDMS] = ddPairToDMS(latDD, lonDD);
    
    // Round trip through DM
    const [latDD2, lonDD2] = dmPairToDD(latDM, lonDM);
    expect(latDD2.degrees).toBeCloseTo(originalLat, TEST_PRECISION.FLOATING_POINT_TOLERANCE); // Sufficient precision for floating point
    expect(lonDD2.degrees).toBeCloseTo(originalLon, TEST_PRECISION.FLOATING_POINT_TOLERANCE); // Sufficient precision for floating point
    
    // Round trip through DMS
    const [latDD3, lonDD3] = dmsPairToDD(latDMS, lonDMS);
    expect(latDD3.degrees).toBeCloseTo(originalLat, TEST_PRECISION.FLOATING_POINT_TOLERANCE); // Sufficient precision for floating point
    expect(lonDD3.degrees).toBeCloseTo(originalLon, TEST_PRECISION.FLOATING_POINT_TOLERANCE); // Sufficient precision for floating point
  });
});