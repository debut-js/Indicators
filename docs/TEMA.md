# Triple Exponential Moving Average (TEMA)

TEMA is a moving average that reduces lag by combining a single, double, and triple EMA. It is more responsive to price changes than a traditional EMA.

## Formula
TEMA = 3 × EMA1 − 3 × EMA2 + EMA3
- EMA1 = EMA of price
- EMA2 = EMA of EMA1
- EMA3 = EMA of EMA2

## Parameters
- `period` (default: 20): Period for all EMAs

## Usage Example
```ts
import { TEMA } from '../src/tema';

const tema = new TEMA();
const result = tema.nextValue(close);
// result: TEMA value
```

## Returns
A single number: the TEMA value for the current input. 