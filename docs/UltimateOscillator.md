# Ultimate Oscillator

The Ultimate Oscillator is a momentum oscillator that combines short, intermediate, and long-term price action into one value.

## Formula
UO = 100 × (4 × avg7 + 2 × avg14 + avg28) / (4 + 2 + 1)
- avgN = sum(BP, N) / sum(TR, N)
- BP = Close − min(Low, PrevClose)
- TR = max(High, PrevClose) − min(Low, PrevClose)

## Parameters
- `period1` (default: 7): Short period
- `period2` (default: 14): Medium period
- `period3` (default: 28): Long period

## Usage Example
```ts
import { UltimateOscillator } from '../src/ultimate-oscillator';

const uo = new UltimateOscillator();
const result = uo.nextValue(high, low, close);
// result: Ultimate Oscillator value
```

## Returns
A single number: the Ultimate Oscillator value for the current input. 