# Detrended Price Oscillator (DPO)

The Detrended Price Oscillator (DPO) is used to eliminate the long-term trends in prices by comparing the price to a shifted moving average.

## Formula
DPO = Price − SMA(shifted)
- The SMA is shifted back by (period / 2 + 1) bars

## Parameters
- `period` (default: 20): Period for SMA

## Usage Example
```ts
import { DPO } from '../src/dpo';

const dpo = new DPO();
const result = dpo.nextValue(close);
// result: DPO value
```

## Returns
A single number: the DPO value for the current input. 