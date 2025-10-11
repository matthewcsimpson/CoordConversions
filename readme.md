# CoordConversion

A robust TypeScript library for converting between different geographic coordinate formats: **Decimal Degrees (DD)**, **Degrees-Minutes (DM)**, and **Degrees-Minutes-Seconds (DMS)**. Features comprehensive parsing, validation, and formatting with support for hemisphere indicators.

## Features

- 🔄 **Bidirectional Conversions**: DD ↔ DM ↔ DMS
- 🌍 **Smart Parsing**: Handles various input formats with automatic hemisphere detection
- ✅ **Robust Validation**: Range checking and format validation
- 🎯 **Type Safety**: Full TypeScript support with comprehensive type definitions
- 📐 **Precision Control**: Configurable decimal precision for output formatting
- 🤝 **Pair Functions**: Work with latitude/longitude pairs together
- 🎨 **Rich Formatting**: Multiple formatting options for all coordinate types
- 🧪 **Well Tested**: Comprehensive test suite with round-trip validation
- 📦 **Zero Dependencies**: Lightweight with no external dependencies
- 🚀 **Modern Build**: ES modules and CommonJS support

## Installation

```bash
npm install coordconversion
```

## Quick Start

These are the available imports from the library.

```typescript
import {
  // For ndividual coordinates
  parseToDD, // Parse values to Decimal Degrees (DD)
  ddToDM, // Convert DD to Degrees-Minutes (DM)
  ddToDMS, // Convert DD to Degrees-Minutes-Seconds (DMS)
  dmToDD, // Convert DM to DD
  dmsToDD, // Convert DMS to DD
  formatDD, // Format DD for display
  formatDM, // Format DM for display
  formatDMS, // Format DMS for display
  // Fir coordinate pairs
  parsePairToDD, // Parse a pair of values to Decimal Degrees (DD)
  ddPairToDM, // Convert a pair of DD values to Degrees-Minutes (DM)
  ddPairToDMS, // Convert a pair of DD values to Degrees-Minutes-Seconds (DMS)
  dmPairToDD, // Convert a pair of DM values to DD
  dmsPairToDD, // Convert a pair of DMS values to DD
  formatDDPair, // Format a pair of DD values for display
  formatDMPair, // Format a pair of DM values for display
  formatDMSPair, // Format a pair of DMS values for display
  // Coordinate type for type safety
  CoordinateType,
} from "coordconversion";
```

## Usage

### Single-coordinate conversions

```typescript
// Start from a decimal-degree string
const latDD = parseToDD("37.7749° N", CoordinateType.LAT); // { kind: "lat", degrees: 37.7749 }
const latAsDM = ddToDM(latDD); // convert to DM
const latAsDMS = ddToDMS(latDD); // convert to DMS

console.log(formatDD(latDD)); // e.g. "37.77490° N"
console.log(formatDM(latAsDM)); // e.g. "37° 46.49' N"
console.log(formatDMS(latAsDMS)); // e.g. "37° 46' 29.64\" N"
```

```typescript
// Construct DM/DMS objects and convert back to DD
const dm = { kind: CoordinateType.LAT, degrees: 37, minutes: 46.49, hemi: "N" };
const dms = {
  kind: CoordinateType.LON,
  degrees: 122,
  minutes: 25,
  seconds: 9.84,
  hemi: "W",
};

const dmToDecimal = dmToDD(dm); // { kind: "lat", degrees: 37.774833... }
const dmsToDecimal = dmsToDD(dms); // { kind: "lon", degrees: -122.4194 }
```

You can control displayed precision:

```typescript
const highPrecDM = ddToDM(latDD, { decimals: 4 });
console.log(formatDM(highPrecDM)); // minutes shown with 4 decimals
```

### Pair conversions (latitude + longitude)

```typescript
// Parse a coordinate pair (numeric or string input)
const [lat, lon] = parsePairToDD(37.7749, -122.4194);

// Convert the pair to DM and DMS
const [latDM, lonDM] = ddPairToDM(lat, lon, { decimals: 2 });
const [latDMS, lonDMS] = ddPairToDMS(lat, lon, { decimals: 2 });

// Format for display
const [latDMStr, lonDMStr] = formatDMPair(latDM, lonDM);
const [latDMSStr, lonDMSStr] = formatDMSPair(latDMS, lonDMS);

console.log("DM:", latDMStr, lonDMStr); // "37° 46.49' N" "122° 25.09' W"
console.log("DMS:", latDMSStr, lonDMSStr); // "37° 46' 29.64\" N" "122° 25' 9.84\" W"

// Round-trip: convert DM/DMS back to DD
const [latBack, lonBack] = dmPairToDD(latDM, lonDM);
const [latBack2, lonBack2] = dmsPairToDD(latDMS, lonDMS);
```

### Handling edge cases

- Use decimals to increase display precision.
- Use clamp when converting values that may fall outside valid ranges (e.g., during programmatic adjustments).

```typescript
// Example with clamp enabled
const dd = parseToDD("91°", CoordinateType.LAT); // will throw without clamp
const safeDM = ddToDM(
  { kind: CoordinateType.LAT, degrees: 91 },
  { clamp: true }
);
console.log(formatDM(safeDM)); // clamped to +90° representation
```

These patterns cover common workflows: parse → convert → format, and convert objects back to decimal degrees for calculations or validation.

## API Reference

### Core Type

```typescript
enum CoordinateType {
  LAT = "lat", // Latitude
  LON = "lon", // Longitude
}
```

### Parsing Functions

#### `parseToDD(input: string | number, kind: CoordinateType): DD`

Parses various coordinate formats into Decimal Degrees.

**Supported Input Formats:**

- Decimal degrees: `"45.123"`, `45.123`
- Degrees-minutes: `"45° 7.38'"`, `"45 7.38 N"`
- Degrees-minutes-seconds: `"45° 7' 22.8" N"`, `"45 7 22.8"`
- With hemisphere indicators: `"N"`, `"S"`, `"E"`, `"W"`

**Examples:**

```typescript
parseToDD("45.123", CoordinateType.LAT); // { kind: "lat", degrees: 45.123 }
parseToDD("45° 7.38' N", CoordinateType.LAT); // { kind: "lat", degrees: 45.123 }
parseToDD("45° 7' 22.8\" N", CoordinateType.LAT); // { kind: "lat", degrees: 45.123 }
parseToDD("-122.4194", CoordinateType.LON); // { kind: "lon", degrees: -122.4194 }
```

### Conversion Functions

#### `ddToDM(dd: DD, opts?: { decimals?: number; clamp?: boolean }): DM`

Converts Decimal Degrees to Degrees-Minutes format.

**Options:**

- `decimals`: Number of decimal places for minutes (default: 2)
- `clamp`: Whether to clamp degrees to valid ranges (default: false)

#### `ddToDMS(dd: DD, opts?: { decimals?: number; clamp?: boolean }): DMS`

Converts Decimal Degrees to Degrees-Minutes-Seconds format.

**Options:**

- `decimals`: Number of decimal places for seconds (default: 2)
- `clamp`: Whether to clamp degrees to valid ranges (default: false)

#### `dmToDD(dm: DM): DD`

Converts Degrees-Minutes back to Decimal Degrees.

#### `dmsToDD(dms: DMS): DD`

Converts Degrees-Minutes-Seconds back to Decimal Degrees.

### Pair Functions

#### `parsePairToDD(latInput: string | number, lonInput: string | number): [DD, DD]`

Parses a pair of coordinate strings/numbers into Decimal Degrees format.

```typescript
// Parse coordinate pairs
const [lat, lon] = parsePairToDD("48.8544° N", "123.5005° W");
// lat: { kind: "lat", degrees: 48.8544 }
// lon: { kind: "lon", degrees: -123.5005 }

// Parse numeric pairs
const [lat2, lon2] = parsePairToDD(48.8544, -123.5005);
// lat2: { kind: "lat", degrees: 48.8544 }
// lon2: { kind: "lon", degrees: -123.5005 }
```

#### `ddPairToDM(latDD: DD, lonDD: DD, opts?: { decimals?: number; clamp?: boolean }): [DM, DM]`

Converts a pair of Decimal Degrees to Degrees-Minutes format.

```typescript
const latDD = { kind: CoordinateType.LAT, degrees: 48.8544 };
const lonDD = { kind: CoordinateType.LON, degrees: -123.5005 };
const [latDM, lonDM] = ddPairToDM(latDD, lonDD);
// latDM: { kind: "lat", degrees: 48, minutes: 51.26, hemi: "N" }
// lonDM: { kind: "lon", degrees: 123, minutes: 30.03, hemi: "W" }
```

#### `ddPairToDMS(latDD: DD, lonDD: DD, opts?: { decimals?: number; clamp?: boolean }): [DMS, DMS]`

Converts a pair of Decimal Degrees to Degrees-Minutes-Seconds format.

```typescript
const [latDMS, lonDMS] = ddPairToDMS(latDD, lonDD);
// latDMS: { kind: "lat", degrees: 48, minutes: 51, seconds: 15.84, hemi: "N" }
// lonDMS: { kind: "lon", degrees: 123, minutes: 30, seconds: 1.8, hemi: "W" }
```

#### `dmPairToDD(latDM: DM, lonDM: DM): [DD, DD]`

Converts a pair of Degrees-Minutes back to Decimal Degrees format.

```typescript
// TypeScript automatically infers the DM type structure
const latDM = {
  kind: CoordinateType.LAT,
  degrees: 48,
  minutes: 51.26,
  hemi: "N", // String literal, not Hemisphere.N
};
const lonDM = {
  kind: CoordinateType.LON,
  degrees: 123,
  minutes: 30.03,
  hemi: "W", // String literal, not Hemisphere.W
};
const [latDD, lonDD] = dmPairToDD(latDM, lonDM);
// latDD: { kind: "lat", degrees: 48.8544 }
// lonDD: { kind: "lon", degrees: -123.5005 }
```

#### `dmsPairToDD(latDMS: DMS, lonDMS: DMS): [DD, DD]`

Converts a pair of Degrees-Minutes-Seconds back to Decimal Degrees format.

```typescript
const latDMS = {
  kind: CoordinateType.LAT,
  degrees: 48,
  minutes: 51,
  seconds: 15.84,
  hemi: "N",
};
const lonDMS = {
  kind: CoordinateType.LON,
  degrees: 123,
  minutes: 30,
  seconds: 1.8,
  hemi: "W",
};
const [latDD, lonDD] = dmsPairToDD(latDMS, lonDMS);
// latDD: { kind: "lat", degrees: 48.8544 }
// lonDD: { kind: "lon", degrees: -123.5005 }
```

### Formatting Functions

#### `formatDD(dd: DD, decimals?: number): string`

Formats Decimal Degrees as a readable string.

```typescript
formatDD({ kind: CoordinateType.LAT, degrees: 45.123 }, 3);
// "45.123° N"
```

**Note:** Default decimals is 5.

#### `formatDM(dm: DM, decimals?: number): string`

Formats Degrees-Minutes as a readable string.

```typescript
formatDM({
  kind: CoordinateType.LAT,
  degrees: 45,
  minutes: 7.38,
  hemi: "N", // String literal, not Hemisphere.N
});
// "45° 7.38' N"
```

**Note:** Default decimals is 2.

#### `formatDMS(dms: DMS, decimals?: number): string`

Formats Degrees-Minutes-Seconds as a readable string.

```typescript
formatDMS({
  kind: CoordinateType.LAT,
  degrees: 45,
  minutes: 7,
  seconds: 22.8,
  hemi: "N", // String literal, not Hemisphere.N
});
// "45° 7' 22.80\" N"
```

**Note:** Default decimals is 2.

### Pair Formatting Functions

#### `formatDDPair(latDD: DD, lonDD: DD, decimals?: number): [string, string]`

Formats a pair of Decimal Degrees as human-readable strings.

```typescript
const latDD = { kind: CoordinateType.LAT, degrees: 48.8544 };
const lonDD = { kind: CoordinateType.LON, degrees: -123.5005 };
const [latStr, lonStr] = formatDDPair(latDD, lonDD);
// latStr: "48.85440° N"
// lonStr: "123.50050° W"
```

#### `formatDMPair(latDM: DM, lonDM: DM, decimals?: number): [string, string]`

Formats a pair of Degrees-Minutes as human-readable strings.

```typescript
const latDM = {
  kind: CoordinateType.LAT,
  degrees: 48,
  minutes: 51.26,
  hemi: "N", // String literal, not Hemisphere.N
};
const lonDM = {
  kind: CoordinateType.LON,
  degrees: 123,
  minutes: 30.03,
  hemi: "W", // String literal, not Hemisphere.W
};
const [latStr, lonStr] = formatDMPair(latDM, lonDM);
// latStr: "48° 51.26' N"
// lonStr: "123° 30.03' W"
```

#### `formatDMSPair(latDMS: DMS, lonDMS: DMS, decimals?: number): [string, string]`

Formats a pair of Degrees-Minutes-Seconds as human-readable strings.

```typescript
const latDMS = {
  kind: CoordinateType.LAT,
  degrees: 48,
  minutes: 51,
  seconds: 15.84,
  hemi: "N", // String literal, not Hemisphere.N
};
const lonDMS = {
  kind: CoordinateType.LON,
  degrees: 123,
  minutes: 30,
  seconds: 1.8,
  hemi: Hemisphere.W,
};
const [latStr, lonStr] = formatDMSPair(latDMS, lonDMS);
// latStr: "48° 51' 15.84\" N"
// lonStr: "123° 30' 1.80\" W"
```

## Validation and Error Handling

The library includes comprehensive validation:

- **Range Validation**: Latitude (-90° to +90°), Longitude (-180° to +180°)
- **Format Validation**: Minutes (0-60), Seconds (0-60)
- **Input Validation**: Finite number checking, format recognition
- **Error Messages**: Descriptive error messages for debugging

**Common Errors:**

```typescript
// Range errors
parseToDD("91", CoordinateType.LAT); // Error: LAT degrees out of range: 91

// Format errors
parseToDD("45° 65' N", CoordinateType.LAT); // Error: Minutes must be < 60

// Invalid input
parseToDD("invalid", CoordinateType.LAT); // Error: Unrecognized coordinate format
```

## Advanced Usage

### Custom Precision

```typescript
// Parse and convert with custom precision
const dd = parseToDD("45.123456789", CoordinateType.LAT);

// High precision DM
const dm = ddToDM(dd, { decimals: 4 });
console.log(formatDM(dm)); // "45° 7.4074' N"

// High precision DMS
const dms = ddToDMS(dd, { decimals: 3 });
console.log(formatDMS(dms)); // "45° 7' 24.444\" N"
```

### Clamping Values

```typescript
// Parse invalid latitude (will throw error without clamp)
// const invalidLat = parseToDD("95", CoordinateType.LAT); // Error!

// Use clamp option to handle out-of-range values during conversion
const validDD = parseToDD("89.5", CoordinateType.LAT); // Valid input
const clampedDM = ddToDM(validDD, { clamp: true });
console.log(formatDM(clampedDM)); // "89° 30.00' N"
```

### Batch Processing

```typescript
const coordinates = ["40.7128° N", "74.0060° W", "51.5074° N", "0.1278° W"];

const parsed = coordinates.map((coord, index) =>
  parseToDD(coord, index % 2 === 0 ? CoordinateType.LAT : CoordinateType.LON)
);
```

### Working with Coordinate Pairs

```typescript
// Parse coordinate pairs from various formats
const [lat1, lon1] = parsePairToDD("48.8544° N", "123.5005° W");
const [lat2, lon2] = parsePairToDD(48.8544, -123.5005);
const [lat3, lon3] = parsePairToDD("48° 51.26' N", "123° 30.03' W");

// Convert pairs to all formats
const [latDM, lonDM] = ddPairToDM(lat1, lon1);
const [latDMS, lonDMS] = ddPairToDMS(lat1, lon1);

// Format pairs for display
const [latDDStr, lonDDStr] = formatDDPair(lat1, lon1);
const [latDMStr, lonDMStr] = formatDMPair(latDM, lonDM);
const [latDMSStr, lonDMSStr] = formatDMSPair(latDMS, lonDMS);

console.log("DD:", latDDStr, lonDDStr); // "48.85440° N" "123.50050° W"
console.log("DM:", latDMStr, lonDMStr); // "48° 51.26' N" "123° 30.03' W"
console.log("DMS:", latDMSStr, lonDMSStr); // "48° 51' 15.84\" N" "123° 30' 1.80\" W"
```

### Complete Workflow Example

```typescript
// Complete workflow: Parse → Convert → Format
const [lat, lon] = parsePairToDD("48.8544° N", "123.5005° W");

// Convert to all formats
const [latDM, lonDM] = ddPairToDM(lat, lon);
const [latDMS, lonDMS] = ddPairToDMS(lat, lon);

// Format all formats
const [latDDStr, lonDDStr] = formatDDPair(lat, lon);
const [latDMStr, lonDMStr] = formatDMPair(latDM, lonDM);
const [latDMSStr, lonDMSStr] = formatDMSPair(latDMS, lonDMS);

// Round trip validation
const [latBack, lonBack] = dmPairToDD(latDM, lonDM);
const [latBack2, lonBack2] = dmsPairToDD(latDMS, lonDMS);

console.log("Original:", lat.degrees, lon.degrees);
console.log("From DM:", latBack.degrees, lonBack.degrees);
console.log("From DMS:", latBack2.degrees, lonBack2.degrees);
```

## Coordinate Format Reference

| Format  | Description             | Example          |
| ------- | ----------------------- | ---------------- |
| **DD**  | Decimal Degrees         | `45.123° N`      |
| **DM**  | Degrees-Minutes         | `45° 7.38' N`    |
| **DMS** | Degrees-Minutes-Seconds | `45° 7' 22.8" N` |

### Valid Ranges

- **Latitude**: -90° to +90° (N/S)
- **Longitude**: -180° to +180° (E/W)
- **Minutes**: 0 to 60 (exclusive)
- **Seconds**: 0 to 60 (exclusive)

## License

MIT © Matthew Simpson
