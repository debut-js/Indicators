# Force Index

The Force Index is a volume-based oscillator that measures the strength of bulls and bears by combining price and volume.

## Formula
Force Index = (Current Close − Previous Close) × Volume

## Parameters
- None (uses raw calculation)

## Usage Example
```ts
import { ForceIndex } from '../src/force-index';

const fi = new ForceIndex();
const result = fi.nextValue(close, volume);
// result: Force Index value
```

## Returns
A single number: the Force Index value for the current input. 