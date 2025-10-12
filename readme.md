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

## API Reference

### Core Type

```typescript
enum CoordinateType {
  LAT = "lat", // Latitude
  LON = "lon", // Longitude
}
```

### Available Functions

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
  // For coordinate pairs
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

### Quick Start

#### Single Coordinate Conversion

Functions follow a parse -> convert -> format flow.

1. Start by parsing a coordinate.

```typescript
const dd = parseToDD("45° 7' 22.8\" N", CoordinateType.LAT);
```

2. Convert the result to another format.

```typescript
const dm = ddToDM(dd);
```

3. Format the restult into a readable string.

```typescript
formatDM(dm);
```

This can be accomplished in a single line.

```typescript
const formatted = formatDM(
  ddToDM(parseToDD("45° 7' 22.8\" N", CoordinateType.LAT))
);
console.log(formatted); // return "45° 7.38' N"
```

#### Coordinate Pairs

1. Parse a coordinate pair

```typescript
const [lat, lon] = parsePairToDD("48.8544° N", "123.5005° W");
```

2. Convert the result to another format

```typescript
const [latDM, lonDM] = ddPairToDM(lat, lon);
```

3. Format the result into a readable string

```typescript
const [latStr, lonStr] = formatDMPair(latDM, lonDM);
console.log(latStr, lonStr); // e.g. "48° 51.26' N", "123° 30.03' W"
```

```typescript
// One-liner: parse pair -> convert to DM pair -> format DM pair
const [latStr, lonStr] = formatDMPair(
  ...ddPairToDM(...parsePairToDD("48.8544° N", "123.5005° W"))
);
console.log(latStr, lonStr); // e.g. "48° 51.26' N", "123° 30.03' W"
```

_Continue reading for detailed descriptions of functions including return data types/shapes and function options._

### Parsing Functions

#### `parseToDD` - Smart Coordinate Parser

Takes any coordinate string or number and converts it to decimal degrees format. Automatically detects and handles different input formats including hemisphere indicators.

**Supported formats:**

- Decimal degrees, eg `"45.123"`
- Degrees-minutes, eg `"45° 7.38'"` or `"45 7.38 N"`
- Degrees-minutes-seconds, eg `"45° 7' 22.8\" N"` or `"45 7 22.8"`

```typescript
const dd = parseToDD("45° 7' 22.8\" N", CoordinateType.LAT);

// returns
//  {
//    kind: "lat",
//    degrees: 45.123
//  }
```

#### `parsePairToDD` - Parse Coordinate Pairs

**What it does:** Takes latitude and longitude inputs (strings or numbers) and converts both to decimal degrees format in one function call.

```typescript
const [lat, lon] = parsePairToDD("48.8544° N", "123.5005° W");

// returns
//  [
//    {
//      kind: "lat",
//      degrees: 48.8544
//    },
//    {
//      kind: "lon",
//      degrees: -123.5005
//    }
//  ]
```

### Conversion Functions (Single Coordinates)

#### `ddToDM` - Decimal Degrees to Degrees-Minutes

- Converts decimal degrees to degrees and minutes format.
- Includes options for precision control and range clamping.

```typescript
const dm = ddToDM({ kind: "lat", degrees: 45.123 });

// returns
//  {
//    kind: "lat",
//    degrees: 45,
//    minutes: 7.38,
//    hemi: "N"
//  }
```

#### `ddToDMS` - Decimal Degrees to Degrees-Minutes-Seconds

**What it does:** Converts decimal degrees to degrees, minutes, and seconds format. Provides the highest precision breakdown of coordinates.

```typescript
const dms = ddToDMS({ kind: "lat", degrees: 45.123 });

// returns
//  {
//    kind: "lat",
//    degrees: 45,
//    minutes: 7,
//    seconds: 22.80,
//    hemi: "N"
//  }
```

#### `dmToDD` - Degrees-Minutes to Decimal Degrees

**What it does:** Converts degrees-minutes format back to decimal degrees. Validates that minutes are within valid range (0-60).

```typescript
const dd = dmToDD({ kind: "lat", degrees: 45, minutes: 7.38, hemi: "N" });
// returns
//  {
//    kind: "lat",
//    degrees: 45.123
//  }
```

#### `dmsToDD` - Degrees-Minutes-Seconds to Decimal Degrees

**What it does:** Converts degrees-minutes-seconds format back to decimal degrees. Validates that minutes and seconds are within valid ranges.

```typescript
const dd = dmsToDD({
  kind: "lat",
  degrees: 45,
  minutes: 7,
  seconds: 22.8,
  hemi: "N",
});

// returns
//  {
//    kind: "lat",
//    degrees: 45.123
//  }
```

### Conversion Functions (Coordinate Pairs)

#### `ddPairToDM` - Convert DD Pair to DM Pair

**What it does:** Converts both latitude and longitude from decimal degrees to degrees-minutes format in one function call.

```typescript
const [latDM, lonDM] = ddPairToDM(latDD, lonDD);

// returns
//  [
//    {
//      kind: "lat",
//      degrees: 48,
//      minutes: 51.26,
//      hemi: "N" },
//    {
//      kind: "lon",
//      degrees: 123,
//      minutes: 30.03,
//      hemi: "W"
//  }
//  ]
```

#### `ddPairToDMS` - Convert DD Pair to DMS Pair

**What it does:** Converts both latitude and longitude from decimal degrees to degrees-minutes-seconds format in one function call.

```typescript
const [latDMS, lonDMS] = ddPairToDMS(latDD, lonDD);

// returns
//  [
//    {
//      kind: "lat",
//      degrees: 48,
//      minutes: 51,
//      seconds: 15.84,
//      hemi: "N"
//    },
//    {
//      kind: "lon",
//      degrees: 123,
//      minutes: 30,
//      seconds: 1.8,
//      hemi: "W"
//    }
//  ]
```

#### `dmPairToDD` - Convert DM Pair to DD Pair

**What it does:** Converts both latitude and longitude from degrees-minutes format back to decimal degrees in one function call.

```typescript
const [latDD, lonDD] = dmPairToDD(latDM, lonDM);

// returns
//  [
//    {
//      kind: "lat",
//      degrees: 48.8544
//    },
//    {
//      kind: "lon",
//      degrees: -123.5005
//    }
//  ]
```

#### `dmsPairToDD` - Convert DMS Pair to DD Pair

**What it does:** Converts both latitude and longitude from degrees-minutes-seconds format back to decimal degrees in one function call.

```typescript
const [latDD, lonDD] = dmsPairToDD(latDMS, lonDMS);

// returns
//  [
//    {
//      kind: "lat",
//      degrees: 48.8544
//    },
//    {
//      kind: "lon",
//      degrees: -123.5005
//    }
//  ]
```

### Formatting Functions (Single Coordinates)

#### `formatDD` - Format Decimal Degrees for Display

**What it does:** Takes a decimal degrees object and formats it as a human-readable string with hemisphere indicator. Default precision is 5 decimal places.

```typescript
const formatted = formatDD({ kind: "lat", degrees: 45.123 });

// returns "45.12300° N"
```

#### `formatDM` - Format Degrees-Minutes for Display

**What it does:** Takes a degrees-minutes object and formats it as a human-readable string with degree and minute symbols. Default precision is 2 decimal places for minutes.

```typescript
const formatted = formatDM({
  kind: "lat",
  degrees: 45,
  minutes: 7.38,
  hemi: "N",
});

// returns "45° 7.38' N"
```

#### `formatDMS` - Format Degrees-Minutes-Seconds for Display

**What it does:** Takes a degrees-minutes-seconds object and formats it as a human-readable string with all symbols. Default precision is 2 decimal places for seconds.

```typescript
const formatted = formatDMS({
  kind: "lat",
  degrees: 45,
  minutes: 7,
  seconds: 22.8,
  hemi: "N",
});

// returns "45° 7' 22.80\" N"
```

### Formatting Functions (Coordinate Pairs)

#### `formatDDPair` - Format DD Pair for Display

**What it does:** Formats both latitude and longitude decimal degrees as human-readable strings in one function call.

```typescript
const [latStr, lonStr] = formatDDPair(latDD, lonDD);

// returns
//  [
//    "48.85440° N",
//    "123.50050° W"
//  ]
```

#### `formatDMPair` - Format DM Pair for Display

**What it does:** Formats both latitude and longitude degrees-minutes as human-readable strings in one function call.

```typescript
const [latStr, lonStr] = formatDMPair(latDM, lonDM);

// returns
//  [
//    "48° 51.26' N",
//    "123° 30.03' W"
//  ]
```

#### `formatDMSPair` - Format DMS Pair for Display

**What it does:** Formats both latitude and longitude degrees-minutes-seconds as human-readable strings in one function call.

```typescript
const [latStr, lonStr] = formatDMSPair(latDMS, lonDMS);

// returns
//  [
//    "48° 51' 15.84\" N",
//    "123° 30' 1.80\" W"
//  ]
```

## Function Options

### Conversion Options

Most conversion functions accept an optional `opts` parameter:

- **`decimals`**: Number of decimal places for the output (varies by function)
- **`clamp`**: Whether to clamp degrees to valid ranges (default: false)

```typescript
// Custom precision
const dm = ddToDM(dd, { decimals: 4 }); // 4 decimal places for minutes
const dms = ddToDMS(dd, { decimals: 3 }); // 3 decimal places for seconds

// Range clamping
const safeDM = ddToDM(dd, { clamp: true }); // Clamps to valid lat/lon ranges
```

### Formatting Options

All formatting functions accept an optional `decimals` parameter:

```typescript
const formatted = formatDD(dd, 3); // 3 decimal places instead of default 5
const formatted2 = formatDM(dm, 4); // 4 decimal places for minutes instead of default 2
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
