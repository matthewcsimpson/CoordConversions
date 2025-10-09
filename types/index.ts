export enum CoordinateType {
  LAT = "lat",
  LON = "lon",
}

export enum Hemisphere {
  N = "N",
  S = "S",
  E = "E",
  W = "W",
}

export interface DD {
  kind: CoordinateType;
  degrees: number;
}
export interface DM {
  kind: CoordinateType;
  degrees: number;
  minutes: number;
  hemi?: Hemisphere;
}
export interface DMS {
  kind: CoordinateType;
  degrees: number;
  minutes: number;
  seconds: number;
  hemi?: Hemisphere;
}
