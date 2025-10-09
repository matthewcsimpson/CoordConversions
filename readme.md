# @mcs/coordconversion

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
npm install @mcs/coordconversion
```

## Quick Start

```typescript
import { 
  parseToDD, 
  ddToDM, 
  ddToDMS, 
  dmToDD, 
  dmsToDD, 
  formatDM, 
  formatDMS, 
  formatDD,
  parsePairToDD,
  ddPairToDM,
  ddPairToDMS,
  formatDMPair,
  formatDMSPair,
  formatDDPair,
  AngleKind 
} from '@mcs/coordconversion';

// Parse individual coordinates
const lat = parseToDD(`48° 51' 23.76" N`, AngleKind.LAT);
const lon = parseToDD('2.3522', AngleKind.LON);

// Parse coordinate pairs
const [latPair, lonPair] = parsePairToDD('48.8544° N', '123.5005° W');

// Convert between formats
const dm = ddToDM(lat);
const dms = ddToDMS(lon);

// Convert pairs
const [latDM, lonDM] = ddPairToDM(latPair, lonPair);
const [latDMS, lonDMS] = ddPairToDMS(latPair, lonPair);

// Format for display
console.log(formatDM(dm));   // "48° 51.40' N"
console.log(formatDMS(dms)); // "2° 21' 7.92" E"
console.log(formatDD(lat));  // "48.85660° N"

// Format pairs
const [latStr, lonStr] = formatDMPair(latDM, lonDM);
console.log(latStr, lonStr); // "48° 51.26' N" "123° 30.03' W"
```

## API Reference

### Core Types

```typescript
enum AngleKind {
  LAT = "lat",  // Latitude
  LON = "lon"   // Longitude
}

enum Hemisphere {
  N = "N", S = "S", E = "E", W = "W"
}

interface DD {
  kind: AngleKind;
  degrees: number;
}

interface DM {
  kind: AngleKind;
  degrees: number;
  minutes: number;
  hemi?: Hemisphere;
}

interface DMS {
  kind: AngleKind;
  degrees: number;
  minutes: number;
  seconds: number;
  hemi?: Hemisphere;
}
```

### Parsing Functions

#### `parseToDD(input: string | number, kind: AngleKind): DD`

Parses various coordinate formats into Decimal Degrees.

**Supported Input Formats:**

- Decimal degrees: `"45.123"`, `45.123`
- Degrees-minutes: `"45° 7.38'"`, `"45 7.38 N"`
- Degrees-minutes-seconds: `"45° 7' 22.8" N"`, `"45 7 22.8"`
- With hemisphere indicators: `"N"`, `"S"`, `"E"`, `"W"`

**Examples:**

```typescript
parseToDD("45.123", AngleKind.LAT)           // { kind: "lat", degrees: 45.123 }
parseToDD("45° 7.38' N", AngleKind.LAT)      // { kind: "lat", degrees: 45.123 }
parseToDD("45° 7' 22.8\" N", AngleKind.LAT)  // { kind: "lat", degrees: 45.123 }
parseToDD("-122.4194", AngleKind.LON)         // { kind: "lon", degrees: -122.4194 }
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
const [lat, lon] = parsePairToDD('48.8544° N', '123.5005° W');
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
const latDD = { kind: AngleKind.LAT, degrees: 48.8544 };
const lonDD = { kind: AngleKind.LON, degrees: -123.5005 };
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
const latDM = { kind: AngleKind.LAT, degrees: 48, minutes: 51.26, hemi: Hemisphere.N };
const lonDM = { kind: AngleKind.LON, degrees: 123, minutes: 30.03, hemi: Hemisphere.W };
const [latDD, lonDD] = dmPairToDD(latDM, lonDM);
// latDD: { kind: "lat", degrees: 48.8544 }
// lonDD: { kind: "lon", degrees: -123.5005 }
```

#### `dmsPairToDD(latDMS: DMS, lonDMS: DMS): [DD, DD]`

Converts a pair of Degrees-Minutes-Seconds back to Decimal Degrees format.

```typescript
const latDMS = { kind: AngleKind.LAT, degrees: 48, minutes: 51, seconds: 15.84, hemi: Hemisphere.N };
const lonDMS = { kind: AngleKind.LON, degrees: 123, minutes: 30, seconds: 1.8, hemi: Hemisphere.W };
const [latDD, lonDD] = dmsPairToDD(latDMS, lonDMS);
// latDD: { kind: "lat", degrees: 48.8544 }
// lonDD: { kind: "lon", degrees: -123.5005 }
```

### Formatting Functions

#### `formatDD(dd: DD, decimals?: number): string`

Formats Decimal Degrees as a readable string.

```typescript
formatDD({ kind: AngleKind.LAT, degrees: 45.123 }, 3)
// "45.123° N"
```

#### `formatDM(dm: DM, decimals?: number): string`

Formats Degrees-Minutes as a readable string.

```typescript
formatDM({ kind: AngleKind.LAT, degrees: 45, minutes: 7.38, hemi: Hemisphere.N })
// "45° 7.38' N"
```

#### `formatDMS(dms: DMS, decimals?: number): string`

Formats Degrees-Minutes-Seconds as a readable string.

```typescript
formatDMS({ kind: AngleKind.LAT, degrees: 45, minutes: 7, seconds: 22.8, hemi: Hemisphere.N })
// "45° 7' 22.80" N"
```

### Pair Formatting Functions

#### `formatDDPair(latDD: DD, lonDD: DD, decimals?: number): [string, string]`

Formats a pair of Decimal Degrees as human-readable strings.

```typescript
const latDD = { kind: AngleKind.LAT, degrees: 48.8544 };
const lonDD = { kind: AngleKind.LON, degrees: -123.5005 };
const [latStr, lonStr] = formatDDPair(latDD, lonDD);
// latStr: "48.85440° N"
// lonStr: "123.50050° W"
```

#### `formatDMPair(latDM: DM, lonDM: DM, decimals?: number): [string, string]`

Formats a pair of Degrees-Minutes as human-readable strings.

```typescript
const latDM = { kind: AngleKind.LAT, degrees: 48, minutes: 51.26, hemi: Hemisphere.N };
const lonDM = { kind: AngleKind.LON, degrees: 123, minutes: 30.03, hemi: Hemisphere.W };
const [latStr, lonStr] = formatDMPair(latDM, lonDM);
// latStr: "48° 51.26' N"
// lonStr: "123° 30.03' W"
```

#### `formatDMSPair(latDMS: DMS, lonDMS: DMS, decimals?: number): [string, string]`

Formats a pair of Degrees-Minutes-Seconds as human-readable strings.

```typescript
const latDMS = { kind: AngleKind.LAT, degrees: 48, minutes: 51, seconds: 15.84, hemi: Hemisphere.N };
const lonDMS = { kind: AngleKind.LON, degrees: 123, minutes: 30, seconds: 1.8, hemi: Hemisphere.W };
const [latStr, lonStr] = formatDMSPair(latDMS, lonDMS);
// latStr: "48° 51' 15.84" N"
// lonStr: "123° 30' 1.80" W"
```

### Utility Functions

#### `detectKindFromHemi(hemi: Hemisphere): AngleKind`

Determines coordinate type from hemisphere indicator.

```typescript
detectKindFromHemi(Hemisphere.N)  // AngleKind.LAT
detectKindFromHemi(Hemisphere.E)  // AngleKind.LON
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
parseToDD("91", AngleKind.LAT)  // Error: LAT degrees out of range: 91

// Format errors
parseToDD("45° 65' N", AngleKind.LAT)  // Error: Minutes must be < 60

// Invalid input
parseToDD("invalid", AngleKind.LAT)  // Error: Unrecognized coordinate format
```

## Advanced Usage

### Custom Precision

```typescript
const dd = { kind: AngleKind.LAT, degrees: 45.123456789 };

// High precision DM
const dm = ddToDM(dd, { decimals: 4 });
console.log(formatDM(dm)); // "45° 7.4074' N"

// High precision DMS
const dms = ddToDMS(dd, { decimals: 3 });
console.log(formatDMS(dms)); // "45° 7' 24.444" N"
```

### Clamping Values

```typescript
const invalidLat = { kind: AngleKind.LAT, degrees: 95 };

// Clamp to valid range
const clampedDM = ddToDM(invalidLat, { clamp: true });
console.log(formatDM(clampedDM)); // "90° 0.00' N"
```

### Batch Processing

```typescript
const coordinates = [
  "40.7128° N",
  "74.0060° W",
  "51.5074° N",
  "0.1278° W"
];

const parsed = coordinates.map((coord, index) => 
  parseToDD(coord, index % 2 === 0 ? AngleKind.LAT : AngleKind.LON)
);
```

### Working with Coordinate Pairs

```typescript
// Parse coordinate pairs from various formats
const [lat1, lon1] = parsePairToDD('48.8544° N', '123.5005° W');
const [lat2, lon2] = parsePairToDD(48.8544, -123.5005);
const [lat3, lon3] = parsePairToDD('48° 51.26\' N', '123° 30.03\' W');

// Convert pairs to all formats
const [latDM, lonDM] = ddPairToDM(lat1, lon1);
const [latDMS, lonDMS] = ddPairToDMS(lat1, lon1);

// Format pairs for display
const [latDDStr, lonDDStr] = formatDDPair(lat1, lon1);
const [latDMStr, lonDMStr] = formatDMPair(latDM, lonDM);
const [latDMSStr, lonDMSStr] = formatDMSPair(latDMS, lonDMS);

console.log('DD:', latDDStr, lonDDStr);   // "48.85440° N" "123.50050° W"
console.log('DM:', latDMStr, lonDMStr);   // "48° 51.26' N" "123° 30.03' W"
console.log('DMS:', latDMSStr, lonDMSStr); // "48° 51' 15.84" N" "123° 30' 1.80" W"
```

### Complete Workflow Example

```typescript
// Complete workflow: Parse → Convert → Format
const [lat, lon] = parsePairToDD('48.8544° N', '123.5005° W');

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

console.log('Original:', lat.degrees, lon.degrees);
console.log('From DM:', latBack.degrees, lonBack.degrees);
console.log('From DMS:', latBack2.degrees, lonBack2.degrees);
```

## Coordinate Format Reference

| Format | Description | Example |
|--------|-------------|---------|
| **DD** | Decimal Degrees | `45.123° N` |
| **DM** | Degrees-Minutes | `45° 7.38' N` |
| **DMS** | Degrees-Minutes-Seconds | `45° 7' 22.8" N` |

### Valid Ranges

- **Latitude**: -90° to +90° (N/S)
- **Longitude**: -180° to +180° (E/W)
- **Minutes**: 0 to 60 (exclusive)
- **Seconds**: 0 to 60 (exclusive)

## License

MIT © Matthew Simpson