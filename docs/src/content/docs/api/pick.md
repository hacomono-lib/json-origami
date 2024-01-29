---
title: pick
description: pick function picks the specified keys from a JSON object.
---

`pick` function picks the specified keys from a JSON object.

```ts
pick(object, keys, option?)
```

## Arguments

- ### `object`

  type: `object`

  The JSON object to pick keys from.

- ### `keys`

  type: `string[]`

  The keys to pick.

- ### `option`

  type: `object`

  - #### `arrayIndex`

    type: `"dot" | "bracket"`

    default: `"bracket"`

    The index of array to pick.

    e.g.
    `[ "a[0]" ]` will pick to `{ a: ["b"] }` if `arrayIndex` is `"bracket"`,
    and `[ "a.0" ]` will pick to `{ a: { 0: "b" } }` if `arrayIndex` is `"dot"`.

### Example

```ts
import { pick } from 'json-origami';

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

const picked = pick(user, ['id', 'name', 'address.street', 'address.city']);

/**
 * {
 *   id: 1,
 *   name: 'John',
 *   address: {
 *     street: '123 Main St',
 *     city: 'New York',
 *   },
 * }
 */
```
