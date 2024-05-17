---
title: has
description: has function checks if a JSON object has a key.
---

`has` function checks if a JSON object has a key.

```ts
has(object, key, option?)
```

## Arguments

- ### `object`

  type: `object`

  The JSON object to check.

  e.g.
  `{ a: { b: "c" } }` has key `a`, `a.b`.

- ### `key`

  type: `string`

  The key to check.

- ### `option`

  type: `object`

  - #### `arrayIndex`

    type: `"dot" | "bracket"`

    default: `"bracket"`

    The index of array to check.

    e.g.
    `{ a: ["b"] }` has key `a[0]` if `arrayIndex` is `"bracket"`,
    and has key `a.0` if `arrayIndex` is `"dot"`.

  - #### `treatUndefinedAsNonexistent`

    type: `boolean`

    default: `true`

    If `true`, `undefined` is treated as nonexistent.

    e.g.
    `{ a: undefined }` has key `a` if `treatUndefinedAsNonexistent` is `false`,
    and does not have key `a` if `treatUndefinedAsNonexistent` is `true`.

### Example

```ts
import { has } from 'json-origami';

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

has(user, 'id') // true
has(user, 'address.street') // true
```
