# json-origami

Transform and reshape your JSON objects with the artistry of origami, all without any external dependencies.

## Description

`json-origami` is a lightweight utility library crafted with the finesse of origami techniques.
Dive into the world of JSON manipulation without the overhead of additional dependencies.
Whether you're looking to flatten a nested structure or revert a flat map into its multi-dimensional glory, `json-origami` makes the process seamless.

## Key Features

- **Lightweight & Standalone**: Operates without any external dependencies, ensuring quick installations and reduced bundle sizes.
- **fold**: Flatten a multi-layered JSON object into a single-tiered representation.
- **unfold**: Transform a single-layer JSON map back to its original nested structure.
- **twist**: Reshape and reorganize the keys of your JSON structure, mirroring the intricate adjustments made in origami.

## Installation

```bash
npm install json-origami
```

## Usage

### fold

```javascript
import { fold } from 'json-origami'

const obj = {
  a: 1,
  b: {
    c: 2,
    d: [3, { e: 4 }]
  }
}
const result = fold(obj)
console.log(result)
/// { a: 1, 'b.c': 2, 'b.d[0]': 3, 'b.d[1].e': 4 }
```

### unfold

```javascript
import { unfold } from 'json-origami'

const obj = {
  a: 1,
  'b.c': 2,
  'b.d[0]': 3,
  'b.d[1].e': 4
}

const result = unfold(obj)
console.log(result)
/// { a: 1, b: { c: 2, d: [3, { e: 4 }] } }
```

### twist

```javascript
import { twist } from 'json-origami'

const obj = {
  a: 1,
  b: {
    c: 2,
    d: [3, { e: 4 }]
  }
}

const reshapingMap = {
  a: 'foo',
  'b.c': 'bar',
  'b.d': 'baz'
}

const result = twist(obj, reshapingMap)
console.log(result)
/// { foo: 1, bar: 2, baz: [3, { e: 4 }] }
```

## Options

### arrayIndex

**Type**: `'dot' | 'bracket'`
**Default**: 'bracket'

Determines the formatting of array indexes when keys are compressed. Choose between dot notation (.0) or bracket notation ([0]).

```javascript
import { fold } from 'json-origami'

const obj = {
  a: 1,
  b: {
    c: 2,
    d: [3, { e: 4 }]
  }
}

const result = fold(obj, { arrayIndex: 'dot' })
conole.log(result)
/// { a: 1, 'b.c': 2, 'b.d.0': 3, 'b.d.1.e': 4 }
```

## License

[MIT](./LICENSE)

## Contributing

see [CONTRIBUTING.md}(./CONTRIBUTING.md)
