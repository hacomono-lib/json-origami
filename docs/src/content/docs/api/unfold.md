---
title: unfold
description: unfold function converts a key-value pair object into JSON object by unfolding it.
---

`unfold` function converts a key-value pair object into JSON object by unfolding it.

```ts
unfold(object, option?)
```

## Arguments

- ### `object`

  type: `object`

  The key-value pair object to unfold.

  e.g.
  `{ "a.b": "c" }` will be unfolded to `{ a: { b: "c" } }`.

- ### `option`

  type: `object`

  - #### `arrayIndex`

    type: `"dot" | "bracket"`

    default: `"bracket"`

    The index of array to unfold.

    e.g.
    `{ "a[0]": "b" }` will be unfolded to `{ a: ["b"] }` if `arrayIndex` is `"bracket"`,
    and will be unfolded to `{ a: { 0: "b" } }` if `arrayIndex` is `"dot"`.

  - #### `pruneArray`

    type: `boolean`

    default: `true`

    Whether to prune the array when unfolding.

    e.g.
    `{ "a[1]": "b" }` will be unfolded to `{ a: [undefined, "b"] }` if `pruneArray` is `false`,
    and will be unfolded to `{ a: ["b"] }` if `pruneArray` is `true`.

### Example

```ts
import { unfold } from 'json-origami';

const folded = {
  id: 1,
  name: 'John',
  age: 20,
  'address.street': '123 Main St',
  'address.city': 'New York',
  'address.state': 'NY',
  'address.zip': '10001',
};

const unfolded = unfold(folded);
/**
 * {
 *   id: 1,
 *   name: 'John',
 *   age: 20,
 *   address: {
 *     street: '123 Main St',
 *     city: 'New York',
 *     state: 'NY',
 *     zip: '10001',
 *   },
 * }
 */
```
