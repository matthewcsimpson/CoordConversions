# @matthewsimpson/coordconversion

A robust TypeScript library for converting between different geographic coordinate formats: **Decimal Degrees (DD)**, **Degrees-Minutes (DM)**, and **Degrees-Minutes-Seconds (DMS)**. Features comprehensive parsing, validation, and formatting with support for hemisphere indicators.

## Features

- 🔄 **Bidirectional Conversions**: DD ↔ DM ↔ DMS
- 🌍 **Smart Parsing**: Handles various input formats with automatic hemisphere detection
- ✅ **Robust Validation**: Range checking and format validation
- 🎯 **Type Safety**: Full TypeScript support with comprehensive type definitions
- 📐 **Precision Control**: Configurable decimal precision for output formatting
- 🧪 **Well Tested**: Comprehensive test suite with round-trip validation
- 📦 **Zero Dependencies**: Lightweight with no external dependencies
- 🚀 **Modern Build**: ES modules and CommonJS support

## Installation

```bash
npm install @matthewsimpson/coordconversion
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
  AngleKind 
} from '@matthewsimpson/coordconversion';

// Parse various coordinate formats
const lat = parseToDD(`48° 51' 23.76" N`, AngleKind.LAT);
const lon = parseToDD('2.3522', AngleKind.LON);

// Convert between formats
const dm = ddToDM(lat);
const dms = ddToDMS(lon);

// Format for display
console.log(formatDM(dm));   // "48° 51.40' N"
console.log(formatDMS(dms)); // "2° 21' 7.92" E"
console.log(formatDD(lat));  // "48.85660° N"
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