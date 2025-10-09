import { AngleKind, Hemisphere } from "../types";
import { parseToDD, ddToDM, ddToDMS, dmToDD, dmsToDD, formatDM, formatDMS } from '../src';

test('parse DMS → DD', () => {
  const dd = parseToDD(`48° 51' 23.76" N`, AngleKind.LAT);
  expect(+dd.degrees.toFixed(6)).toBeCloseTo(48.856600, 6);
});

test('DD → DM/DMS formatting', () => {
  const dd = { kind: AngleKind.LON, degrees: 2.3522 };
  expect(formatDM(ddToDM(dd))).toMatch(/2° 21\.\d{2}' E/);
  expect(formatDMS(ddToDMS(dd))).toMatch(/2° 21' \d+\.\d{2}" E/);
});

test('DM → DD round trip', () => {
  const dm = { kind: AngleKind.LAT, degrees: 48, minutes: 51.4, hemi: Hemisphere.N };
  const dd = dmToDD(dm);
  expect(+dd.degrees.toFixed(6)).toBeCloseTo(48.856667, 6);
});

test('DMS → DD round trip', () => {
  const dms = { kind: AngleKind.LON, degrees: 151, minutes: 12, seconds: 35.64, hemi: Hemisphere.E };
  const dd = dmsToDD(dms);
  expect(+dd.degrees.toFixed(6)).toBeCloseTo(151.209900, 6);
});