# Volume Oscillator

The Volume Oscillator measures the difference between two moving averages of volume.

## Formula
Volume Oscillator = SMA(short) − SMA(long)

## Parameters
- `shortPeriod` (default: 14): Short period for SMA
- `longPeriod` (default: 28): Long period for SMA

## Usage Example
```ts
import { VolumeOscillator } from '../src/volume-oscillator';

const vo = new VolumeOscillator();
const result = vo.nextValue(volume);
// result: Volume Oscillator value
```

## Returns
A single number: the Volume Oscillator value for the current input. 