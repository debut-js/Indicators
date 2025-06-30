# TRIX (Triple Exponential Average Oscillator)

TRIX is a momentum oscillator that displays the percent rate of change of a triple exponentially smoothed moving average. It is used to identify oversold and overbought markets, as well as momentum.

## Formula
TRIX = [(TEMA - previous TEMA) / previous TEMA] × 100
- TEMA is the triple EMA of price

## Parameters
- `period` (default: 15): Period for all EMAs

## Usage Example
```ts
import { TRIX } from '../src/trix';

const trix = new TRIX();
const result = trix.nextValue(close);
// result: TRIX value
```

## Returns
A single number: the TRIX value for the current input. 