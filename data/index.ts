import { CoordinateType } from "../types";

export const DEG_MAX: Record<CoordinateType, number> = {
  [CoordinateType.LAT]: 90,
  [CoordinateType.LON]: 180,
};

export const PRECISION_DEFAULTS = {
  DD_DECIMALS: 5,
  DM_DECIMALS: 5,
  DMS_DECIMALS: 5,
};

export const CONVERSION_CONSTANTS = {
  MINUTES_PER_DEGREE: 60,
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_DEGREE: 3600,
};
