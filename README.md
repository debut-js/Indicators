![npm](https://img.shields.io/npm/v/@debut/indicators)
![npm](https://img.shields.io/npm/dm/@debut/indicators)
![NPM](https://img.shields.io/npm/l/@debut/indicators)

# Streaming Technical Indicators

> **Sponsored by [Backticks](https://backticks.io)** — a visual canvas to build, backtest and optimize trading strategies in your browser. Built on top of this library.

A streaming, allocation-light technical-analysis toolkit for JavaScript / TypeScript. Every indicator is a class with a `nextValue(...)` method that consumes one bar at a time, so the same code path drives both backtests and live trading without rebuilding state. A second method, `momentValue(...)`, computes the indicator's value for a hypothetical bar without committing any state — useful for tick-by-tick recalculation inside an unfinished candle.

## Features

- **Streaming-first.** O(period) per bar; no full-array recomputation.
- **`momentValue` everywhere.** Ask "what would the value be if this bar closed now?" without mutating state.
- **TypeScript.** Strongly-typed across the public surface.
- **Cross-SDK validated.** 130+ vitest/jest tests cross-check our output against `lightweight-charts-indicators` (oakscriptjs / Pine Script reference) and `technicalindicators` with epsilon ≤ 1e-9.
- **Tiny package.** Ships only the prebuilt `lib/` bundle — ~85 kB tarball.

## Install

```bash
npm install @debut/indicators
```

## Quick start

```ts
import { SMA, RSI, MACD, BollingerBands } from '@debut/indicators';

const sma = new SMA(20);
const rsi = new RSI(14);
const macd = new MACD(12, 26, 9);
const bb = new BollingerBands(20, 2);

for (const bar of bars) {
    const sm = sma.nextValue(bar.close);
    const r = rsi.nextValue(bar.close);
    const m = macd.nextValue(bar.close);   // → { macd, signal, histogram }
    const b = bb.nextValue(bar.close);     // → { lower, middle, upper }
    // ...indicator outputs are `undefined` until each one's warmup completes.
}
```

`nextValue` returns `undefined` until the indicator has seen enough bars to produce a result (its "warmup" — typically `period` bars). After that it returns the current value on every call.

## Streaming model

### `nextValue(...)` — close-of-bar

Call this once per closed bar. The method advances internal state and returns the new indicator value. Subsequent calls reflect the committed state.

### `momentValue(...)` — intra-bar

Call this with the live (still-forming) candle's price/volume to read what the indicator *would* report if the bar closed now, **without** committing any state. Useful when you want to react inside the candle but recompute cleanly when the next real `nextValue` arrives.

```ts
const sma = new SMA(4);
[1, 2, 3].forEach((v) => sma.nextValue(v));   // warmup
sma.momentValue(8);   // 3.5  ← preview if close=8
sma.nextValue(4);     // 2.5  ← actual close=4 commits state
sma.momentValue(8);   // 4.75 ← preview based on committed state
sma.nextValue(8);     // 4.25 ← actual close=8 commits state
```

---

## Available indicators

Below is the full catalog grouped by category. Names in `code style` are the exact named export from `@debut/indicators`.

### Moving Averages

| Indicator | Export | Description |
|-----------|--------|-------------|
| Simple Moving Average | `SMA` | Arithmetic mean over a period. |
| Exponential Moving Average | `EMA` | Weighted average emphasizing recent prices. |
| Weighted Moving Average | `WMA` | Linearly increasing weights toward the latest bar. |
| Linearly Weighted MA | `LWMA` | Linear weighting variant. |
| Exponential Weighted MA | `EWMA` | Configurable α; lighter than EMA for tick smoothing. |
| Smoothed Moving Average | `SMMA` | Wilder smoothing (α = 1/period). |
| Wilder's Smoothed MA | `WEMA` | Same shape as `RMA`, included for compatibility. |
| Welles Wilder's Smoothing | `WWS` | Classic Wilder smoothing. |
| Adaptive Moving Average | `AMA` | Kaufman adaptive — speeds up in trend, slows in chop. |
| Running Moving Average | `RMA` | α = 1/period; SMA-seeded. |
| Hull Moving Average | `HMA` | Reduced-lag MA via WMA chaining. |
| Double EMA | `DEMA` | 2 × EMA − EMA(EMA). |
| Triple EMA | `TEMA` | Three-stage EMA reduction of lag. |
| Arnaud Legoux MA | `ALMA` | Gaussian-weighted MA. |
| Volume Weighted MA | `VWMA` | Each bar weighted by volume. |
| McGinley Dynamic | `McGinleyDynamic` | Self-adjusting MA reacting to market speed. |
| Least Squares MA | `LSMA` | Endpoint of rolling linear regression. |

### Oscillators

| Indicator | Export | Description |
|-----------|--------|-------------|
| Relative Strength Index | `RSI` | Classic 14-period momentum oscillator. |
| Stochastic | `Stochastic` | Close vs. high-low range. |
| Stochastic RSI | `StochasticRSI` | Stochastic applied to RSI. |
| Commodity Channel Index | `CCI` | Deviation-from-mean cyclic oscillator. |
| Williams %R | `Williams` | Inverse-stochastic momentum. |
| Awesome Oscillator | `AO` | Bill Williams 5/34 SMA difference of HL2. |
| Accelerator Oscillator | `AC` | Bill Williams AO derivative. |
| Chande Momentum Oscillator | `CMO` | Wilder-style CMO. |
| Chande MO (LWC) | `ChandeMO` | LWC reference variant; raw rolling sums. |
| Detrended Price Oscillator | `DPO` | SMA-detrended price. |
| Relative Vigor Index | `RVI` | SWMA-based vigor / signal pair. |
| SMI Ergodic | `SMIErgodic` | Double-smoothed momentum (TSI without 100×). |
| True Strength Index | `TSI` | Double-EMA momentum oscillator with signal. |
| Bollinger Bands %B | `BBPercentB` | Price position relative to BB. |
| Fisher Transform | `FisherTransform` | Gaussian-mapped price extremes. |
| Ultimate Oscillator | `UltimateOscillator` | Multi-timeframe weighted momentum. |
| Connor's RSI | `cRSI` | Composite RSI / streak / percent-rank. |
| Relative Volatility Index | `RelativeVolatilityIndex` | RSI on stdev of close. |

### Momentum

| Indicator | Export | Description |
|-----------|--------|-------------|
| MACD | `MACD` | Difference of two EMAs with signal/histogram. |
| Momentum | `Momentum` | `close − close[length]`. |
| Rate of Change | `ROC` | Percentage change over a period. |
| Balance of Power | `BOP` | `(close − open) / (high − low)`. |
| Bull-Bear Power | `BullBearPower` | Elder: `high + low − 2·EMA(close)`. |
| Force Index | `ForceIndex` | Elder: signed price-volume impulse. |
| Elder Ray | `ElderRay` | Bull / bear power split. |
| Price Oscillator | `PriceOscillator` | Percent-PPO with signal/histogram. |
| Coppock Curve | `CoppockCurve` | WMA of summed long/short ROCs. |
| TRIX | `TRIX` | ROC of triple-smoothed EMA. |
| KST | `KST` | "Know Sure Thing" weighted ROC sum + signal. |

### Trend

| Indicator | Export | Description |
|-----------|--------|-------------|
| Average Directional Index | `ADX` | Trend strength irrespective of direction. |
| Directional Movement Index | `DMI` | `+DI`, `−DI`, ADX. |
| Ichimoku Cloud | `Ichimoku` | Conversion / base / spans / lagging. |
| Parabolic SAR | `PSAR` | Welles Wilder's trailing stop. |
| Supertrend | `SuperTrend` | ATR-based dynamic support/resistance. |
| Aroon | `Aroon` | Bars-since-extreme up/down lines. |
| Choppiness | `Choppiness` | Range-vs-volatility chop measure. |
| Mass Index | `MassIndex` | Reversal detection via H-L EMA ratio. |
| Vortex | `Vortex` | VI+ / VI− directional pair. |
| Trend Strength Index | `TrendStrengthIndex` | Pearson correlation of close vs. bar index. |
| Chande Kroll Stop | `ChandeKrollStop` | Long / short ATR-based stop levels. |

### Volatility

| Indicator | Export | Description |
|-----------|--------|-------------|
| Average True Range | `ATR` | Wilder ATR with selectable smoothing. |
| Average Daily Range | `ADR` | SMA of `high − low`. |
| Historical Volatility | `HistoricalVolatility` | Annualized stdev of log returns. |
| Bollinger BandWidth | `BBBandWidth` | `(upper − lower) / basis × 100`. |
| Standard Deviation | `StandardDeviation` | Streaming biased stdev provider. |

### Channels & Bands

| Indicator | Export | Description |
|-----------|--------|-------------|
| Bollinger Bands | `BollingerBands` | SMA ± k × stdev. |
| Donchian Channels | `DC` | Highest-high / lowest-low envelope. |
| Keltner Channel | `KeltnerChannel` | EMA / ATR envelope. |
| Envelopes | `Envelopes` | Fixed-percentage MA bands. |
| Median (with bands ready upstream) | `Median` | Rolling median of HL2. |

### Volume

| Indicator | Export | Description |
|-----------|--------|-------------|
| On Balance Volume | `OBV` | Cumulative signed volume. |
| Money Flow Index | `MFI` | Volume-weighted RSI. |
| Price Volume Trend | `PVT` | Volume scaled by relative price change. |
| Volume Oscillator | `VolumeOscillator` | Difference between volume EMAs. |
| Chaikin Oscillator | `ChaikinOscillator` | EMA spread of A/D line. |
| Chaikin Money Flow | `ChaikinMF` | A/D divided by volume over a window. |
| Ease of Movement | `EaseOfMovement` | Price change vs. volume. |
| Klinger Oscillator | `Klinger` | Long-term money-flow oscillator. |
| Net Volume | `NetVolume` | Signed volume by candle direction. |
| Volume Profile *(beta)* | `VolumeProfile` | Volume distribution by price levels. |

### Candles & Pivots

| Indicator | Export | Description |
|-----------|--------|-------------|
| Heiken Ashi | `HeikenAshi` | Smoothed candle stream. |
| Fractal | `Fractal` | Bill Williams 5-bar fractals. |
| Pivot Levels | `Pivot` | Classic / Woodie / Camarilla / Fibonacci. |
| Trend Lines | `TrendLines` | Pivot-derived trend line detection. |
| Extremums | `Extremums` | Fractal-style local extrema provider. |

### Move / Wave (custom)

| Indicator | Export | Description |
|-----------|--------|-------------|
| Move | `Move` | Direction move with minimum power `p`. |
| Wave | `Wave` | Bullish/bearish candle series with power `p`. |

## Candlestick Patterns

44 patterns ported from the TradingView "All Candlestick Patterns" reference (and the LWC reference implementation). Each is a class that returns `true`/`false` per bar via `nextValue(open, high, low, close)`, returning `undefined` while the lookback warm-up is in progress.

### Isolation: each pattern owns the minimum it needs

Patterns are deliberately self-contained. When you do `new Doji()`, it builds a `Candles` context with **only** the per-bar fields its predicate reads — no EMA(14) of body, no SMA(50) of close. So a standalone `Doji` produces meaningful output from bar 1, while `Hammer` (which reads the trend filter) waits for the SMA(50) warmup, and `FallingThreeMethods` (5-bar pattern with body / trend) waits for both.

```ts
import { Doji, Hammer, FallingThreeMethods } from '@debut/indicators';

new Doji();                // Candles({ lookback: 1, bodyAvg: false, trend: false })
new Hammer();              // Candles({ lookback: 1, bodyAvg: true,  trend: true  })
new FallingThreeMethods(); // Candles({ lookback: 5, bodyAvg: true,  trend: true  })
```

### Combined scan: `AllCandlestickPatterns`

When you want to scan a bar against all 44 patterns at once, use the combined detector. It maintains a single full-feature `Candles` context shared between every pattern, so per-bar derivations are computed exactly once per bar.

```ts
import { AllCandlestickPatterns } from '@debut/indicators';

const detector = new AllCandlestickPatterns();
for (const bar of bars) {
    const fired = detector.nextValue(bar.open, bar.high, bar.low, bar.close);
    if (fired.length) console.log(bar.time, fired);
    // → e.g. [1700000000, ['Hammer', 'LongLowerShadow']]
}
```

### Manually sharing a `Candles` context

If you only need a handful of specific patterns, you can construct a `Candles` with the exact features required and pass it in. The base class validates that the shared context covers each pattern's needs and throws otherwise — so misconfigurations fail fast instead of silently producing wrong output.

```ts
import { Candles, Doji, Hammer, EngulfingBullish } from '@debut/indicators';

const candles = new Candles({ bodyAvg: true, trend: true, lookback: 2 });
const detectors = [new Doji(candles), new Hammer(candles), new EngulfingBullish(candles)];

for (const bar of bars) {
    candles.nextValue(bar.open, bar.high, bar.low, bar.close);
    for (const d of detectors) {
        if (d.detect() === true) console.log('fired:', d.constructor.name, bar.time);
    }
}
```

Or via the `Candlestick` namespace if you'd rather not import 40+ symbols by name:

```ts
import { Candlestick } from '@debut/indicators';

const detector = new Candlestick.AllCandlestickPatterns();
const doji = new Candlestick.Doji();
```

### Pattern catalog

| Lookback | Patterns |
|----------|----------|
| 1 bar    | `Doji`, `DragonflyDoji`, `GravestoneDoji`, `Hammer`, `HangingMan`, `InvertedHammer`, `ShootingStar`, `LongLowerShadow`, `LongUpperShadow`, `MarubozuBlack`, `MarubozuWhite`, `SpinningTopBlack`, `SpinningTopWhite` |
| 2 bars   | `DarkCloudCover`, `DojiStarBearish`, `DojiStarBullish`, `EngulfingBearish`, `EngulfingBullish`, `FallingWindow`, `RisingWindow`, `HaramiBearish`, `HaramiBullish`, `HaramiCrossBearish`, `HaramiCrossBullish`, `KickingBearish`, `KickingBullish`, `OnNeck`, `Piercing`, `TweezerBottom`, `TweezerTop` |
| 3 bars   | `AbandonedBabyBearish`, `AbandonedBabyBullish`, `DownsideTasukiGap`, `UpsideTasukiGap`, `EveningStar`, `EveningDojiStar`, `MorningStar`, `MorningDojiStar`, `ThreeBlackCrows`, `ThreeWhiteSoldiers`, `TriStarBearish`, `TriStarBullish` |
| 5 bars   | `FallingThreeMethods`, `RisingThreeMethods` |

The trend filter (`upTrend`/`downTrend` inside `Candles`) requires SMA-50 of close, so any pattern that reads it cannot fire before bar 50 — matching the upstream Pine reference. Patterns that don't read trend (Doji, all Marubozu / Spinning Top variants, etc.) can fire from bar 1.

## Utilities

| Export | Description |
|--------|-------------|
| `CircularBuffer` | Fixed-size ring buffer with `at()` / `peek()` / `forEach()`. Powers most rolling-window indicators. |
| `Sampler` | Sample-of-sample provider for stacking smoothing (e.g. `SMA(SMA(SMA(...)))`). |
| `Correlation` | Streaming Pearson correlation. |
| `Level`, `UniLevel` | Dynamic level (UniLevel: balanced around 0). |
| `Extremums` | Fractal-style local extrema. |
| `Candles` | Per-bar candlestick context (body, shadows, doji, trend) shared by pattern detectors. |

## Cross-SDK validation

Every ported indicator and candlestick pattern has a vitest-style spec in `tests/<name>/<name>.spec.ts` that:

1. Generates deterministic synthetic OHLCV bars with a seeded LCG (see `tests/lwc-fixtures.ts`).
2. Runs them through the streaming `@debut/indicators` class.
3. Runs the same bars through the corresponding [`lightweight-charts-indicators`](https://github.com/deepentropy/lightweight-charts-indicators) `calculate()` (or `technicalindicators` for the older specs).
4. Asserts numeric equality with epsilon ≤ 1e-9 (or set membership for boolean pattern firings).

Run `npm test` to execute the full suite.

## Benchmarks

Apple M1 Pro, Node v16.14.0. Tested on dataset with 100k elements.

| Indicator name | @debut/indicators (ops/sec) | technicalindicators (ops/sec) | indicatorts (ops/sec) |
|:---:|:---:|:---:|:---:|
| AwesomeOscillator | 318 | 23 | 158 |
| ADX | 358 | 42 | x |
| ATR | 613 | 136 | 95 |
| Bollinger Bands | 347 | 9 | 219 |
| CCI | 151 | 12 | 158 |
| DC | 474 | x | 74 |
| PSAR | 1,453 | 278 | 666 |
| EMA | 1,720 | 452 | 1,537 |
| MACD | 1,417 | 90 | 467 |
| ROC | 3,625 | 64 | x |
| RSI | 1,239 | 38 | 315 |
| SMA | 678 | 65 | 645 |
| WEMA | 1,462 | 455 | x |
| WMA | 287 | 41 | x |
| Stochastic | 340 | 25 | 67 |

*Benchmarks results is autogenerated by https://github.com/debut-js/indicators-benchmark*

## License

GPL-3.0
