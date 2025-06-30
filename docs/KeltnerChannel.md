# Keltner Channel

Keltner Channel is a volatility-based envelope set above and below an exponential moving average (EMA). The channel uses the Average True Range (ATR) to set the distance of the bands.

## Lines
- **Upper Band:** EMA + (ATR * multiplier)
- **Middle Band:** Exponential Moving Average (EMA)
- **Lower Band:** EMA - (ATR * multiplier)

## Parameters
- `period` (default: 20): Period for EMA and ATR
- `multiplier` (default: 2): ATR multiplier for channel width

## Usage Example
```ts
import { KeltnerChannel } from '../src/keltner';

const keltner = new KeltnerChannel();
const result = keltner.nextValue(high, low, close);
// result: { lower, middle, upper }
```

## Returns
An object with the following properties:
- `lower`: Lower band value
- `middle`: Middle band (EMA) value
- `upper`: Upper band value 