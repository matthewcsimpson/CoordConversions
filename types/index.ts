export enum AngleKind {
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
  kind: AngleKind;
  degrees: number;
}
export interface DM {
  kind: AngleKind;
  degrees: number;
  minutes: number;
  hemi?: Hemisphere;
}
export interface DMS {
  kind: AngleKind;
  degrees: number;
  minutes: number;
  seconds: number;
  hemi?: Hemisphere;
}
