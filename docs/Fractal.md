# Fractal Indicator (Bill Williams Fractals)

The Fractal Indicator identifies local highs and lows (fractals) in price data.

## Definition
- A fractal up is a high that is higher than two bars to the left and right.
- A fractal down is a low that is lower than two bars to the left and right.

## Parameters
- `left` (default: 2): Number of bars to the left
- `right` (default: 2): Number of bars to the right

## Usage Example
```ts
import { Fractal } from '../src/fractal';

const fractal = new Fractal();
const result = fractal.nextValue(high, low);
// result: { up, down }
```

## Returns
An object with the following properties:
- `up`: Fractal up value (if found)
- `down`: Fractal down value (if found) 