# Elder Ray Index (Bull Power / Bear Power)

The Elder Ray Index is a trend-following indicator that measures the strength of bulls and bears in the market.

## Formula
- Bull Power = High − EMA
- Bear Power = Low − EMA

## Parameters
- `period` (default: 13): Period for EMA

## Usage Example
```ts
import { ElderRay } from '../src/elder-ray';

const elderRay = new ElderRay();
const result = elderRay.nextValue(high, low, close);
// result: { bull, bear }
```

## Returns
An object with the following properties:
- `bull`: Bull Power value
- `bear`: Bear Power value 