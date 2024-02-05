---
title: fold
description: fold function converts a JSON object into key-value pair object by folding it.
---

`fold` function converts a JSON object into key-value pair object by folding it.

```ts
fold(object, option?)
```

## Arguments

- ### `object`

  type: `object`

  The JSON object to fold.

  e.g.
  `{ a: { b: "c" } }` will be folded to `{ "a.b": "c" }`.

- ### `option`

  type: `object`

  - #### `arrayIndex`

    type: `"dot" | "bracket"`

    default: `"bracket"`

    The index of array to fold.

    e.g.
    `{ a: ["b"] }` will be folded to `{ "a[0]": "b" }` if `arrayIndex` is `"bracket"`,
    and will be folded to `{ "a.0": "b" }` if `arrayIndex` is `"dot"`.

  - #### `keyPrefix`

    type: `string`

    default: `""`

    The prefix to prepend to the folded key.

### Example

```ts
import { fold } from 'json-origami';

const user = {
  id: 1,
  name: 'John',
  age: 20,
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
  },
};

const folded = fold(user)
/**
 * {
 *   id: 1,
 *   name: 'John',
 *   age: 20,
 *   'address.street': '123 Main St',
 *   'address.city': 'New York',
 *   'address.state': 'NY',
 *  'address.zip': '10001',
 * }
 */
```
