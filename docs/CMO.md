# Chande Momentum Oscillator (CMO)

The Chande Momentum Oscillator (CMO) is a momentum indicator that measures the difference between the sum of recent gains and losses over a specified period.

## Formula
CMO = 100 × (Sum of Gains − Sum of Losses) / (Sum of Gains + Sum of Losses)
- Gains: sum of positive changes over period
- Losses: sum of absolute value of negative changes over period

## Parameters
- `period` (default: 14): Period for calculation

## Usage Example
```ts
import { CMO } from '../src/cmo';

const cmo = new CMO();
const result = cmo.nextValue(close);
// result: CMO value
```

## Returns
A single number: the CMO value for the current input. 