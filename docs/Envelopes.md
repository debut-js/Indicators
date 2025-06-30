# Moving Average Envelopes

Moving Average Envelopes are lines plotted at a fixed percentage above and below a moving average (usually SMA). They help identify overbought and oversold conditions, as well as trend direction.

## Lines
- **Upper Envelope:** SMA + (SMA * percent / 100)
- **Middle Line:** Simple Moving Average (SMA)
- **Lower Envelope:** SMA - (SMA * percent / 100)

## Parameters
- `period` (default: 20): Period for the moving average
- `percent` (default: 2): Envelope distance in percent

## Usage Example
```ts
import { Envelopes } from '../src/envelopes';

const envelopes = new Envelopes();
const result = envelopes.nextValue(close);
// result: { lower, middle, upper }
```

## Returns
An object with the following properties:
- `lower`: Lower envelope value
- `middle`: Middle line (SMA) value
- `upper`: Upper envelope value 