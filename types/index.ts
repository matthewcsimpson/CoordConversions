enum CoordinateType {
  LAT = "lat",
  LON = "lon",
}

enum Hemisphere {
  N = "N",
  S = "S",
  E = "E",
  W = "W",
}

interface DD {
  kind: CoordinateType;
  degrees: number;
}
interface DM {
  kind: CoordinateType;
  degrees: number;
  minutes: number;
  hemi?: Hemisphere;
}
interface DMS {
  kind: CoordinateType;
  degrees: number;
  minutes: number;
  seconds: number;
  hemi?: Hemisphere;
}

export { CoordinateType, Hemisphere, DD, DM, DMS };
