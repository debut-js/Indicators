# Ichimoku Cloud (Ichimoku Kinko Hyo)

Ichimoku Cloud is a comprehensive indicator that defines support and resistance, identifies trend direction, gauges momentum, and provides trading signals.

## Lines
- **Tenkan-sen (Conversion Line):** (highest high + lowest low) / 2 for the last 9 periods (default)
- **Kijun-sen (Base Line):** (highest high + lowest low) / 2 for the last 26 periods (default)
- **Senkou Span A (Leading Span A):** (Tenkan-sen + Kijun-sen) / 2, plotted 26 periods ahead
- **Senkou Span B (Leading Span B):** (highest high + lowest low) / 2 for the last 52 periods (default), plotted 26 periods ahead
- **Chikou Span (Lagging Span):** Closing price, plotted 26 periods back

## Parameters
- `periodTenkan` (default: 9): Period for Tenkan-sen
- `periodKijun` (default: 26): Period for Kijun-sen
- `periodSenkouB` (default: 52): Period for Senkou Span B
- `displacement` (default: 26): Displacement for Senkou and Chikou lines

## Usage Example
```ts
import { Ichimoku } from '../src/ichimoku';

const ichimoku = new Ichimoku();
const result = ichimoku.nextValue(high, low, close);
// result: { tenkan, kijun, senkouA, senkouB, chikou }
```

## Returns
An object with the following properties:
- `tenkan`: Tenkan-sen value
- `kijun`: Kijun-sen value
- `senkouA`: Senkou Span A value (current, forward shift is handled on chart)
- `senkouB`: Senkou Span B value (current, forward shift is handled on chart)
- `chikou`: Chikou Span value (close, shifted backward) 