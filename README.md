# json-origami

Transform and reshape your JSON objects with the artistry of origami, all without any external dependencies.

## Description

`json-origami` is a lightweight utility library crafted with the finesse of origami techniques.
Dive into the world of JSON manipulation without the overhead of additional dependencies.
Whether you're looking to flatten a nested structure or revert a flat map into its multi-dimensional glory, `json-origami` makes the process seamless.

## Key Features

- **Lightweight & Standalone**: Operates without any external dependencies, ensuring quick installations and reduced bundle sizes.
- **Simple & Intuitive**: Designed with a simple API that is easy to learn and use.

## Installation

```bash
npm install json-origami
```

## Usage

### fold

Flatten a multi-layered JSON object into a single-tiered representation.

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

Transform a single-layer JSON map back to its original nested structure.

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

Reshape and reorganize the keys of your JSON structure, mirroring the intricate adjustments made in origami.

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

### pick

Select only the specified keys from a JSON object.

```javascript
import { pick } from 'json-origami'

const obj = {
  a: 1,
  b: {
    c: 2,
    d: [3, { e: 4 }]
  }
}

const result = pick(obj, ['a', 'b.c'])
console.log(result)
/// { a: 1, b: { c: 2 } }
```

### omit

Remove the specified keys from a JSON object.

```javascript
import { omit } from 'json-origami'

const obj = {
  a: 1,
  b: {
    c: 2,
    d: [3, { e: 4 }]
  }
}

const result = omit(obj, ['b.c', 'b.d[1]'])
console.log(result)
/// { a: 1, b: { d: [3] } }
```

## Options

### arrayIndex

**Type**: `'dot' | 'bracket'`
**Default**: `'bracket'`

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

### pruneArray

Options for 'unfold', 'twist', 'pick', 'omit'

**Type**: `boolean`
**Default**: `true`

Specifies whether to remove the specified array elements or not.

```javascript
import { twist } from 'json-origami'

const obj = {
  a: 1,
  b: {
    c: 2,
    d: [3, 4, 5, 6]
  }
}

const result1 = twist(obj, { 'b.d[1]': 'D' }, { pruneArray: true })
console.log(result1)
/// { a: 1, b: { c: 2, d: [3, 5, 6] }, D: 4 }

const result2 = twist(obj, { 'b.d[1]': 'D' }, { pruneArray: false })
console.log(result2)
/// { a: 1, b: { c: 2, d: [3, undefined, 5, 6] }, D: 4 }
```

### keyPrefix

Options for 'fold'

**Type**: `string`
**Default**: `''` (empty string)

Adds a specified prefix to the keys in the output.

## License

[MIT](./LICENSE)

## Contributing

see [CONTRIBUTING.md](./CONTRIBUTING.md)
