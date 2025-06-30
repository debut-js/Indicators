# Directional Movement Index (DMI)

The Directional Movement Index (DMI) is a trend indicator that consists of two lines: +DI and -DI. Optionally, the Average Directional Index (ADX) can be included to measure trend strength.

## Lines
- **+DI:** Smoothed positive directional movement
- **-DI:** Smoothed negative directional movement
- **ADX (optional):** Average Directional Index, measures trend strength

## Parameters
- `period` (default: 14): Period for smoothing
- `withADX` (default: false): Whether to calculate ADX as well

## Usage Example
```ts
import { DMI } from '../src/dmi';

const dmi = new DMI();
const result = dmi.nextValue(high, low, close);
// result: { plusDI, minusDI } or { plusDI, minusDI, adx }
```

## Returns
An object with the following properties:
- `plusDI`: Positive Directional Indicator (+DI)
- `minusDI`: Negative Directional Indicator (-DI)
- `adx`: Average Directional Index (if withADX is true) 