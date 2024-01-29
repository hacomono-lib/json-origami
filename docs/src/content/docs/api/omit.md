---
title: omit
description: omit function omits the specified keys from a JSON object.
---

`omit` function omits the specified keys from a JSON object.

```ts
omit(object, keys, option?)
```

## Arguments

- ### `object`

  type: `object`

  The JSON object to omit keys from.

- ### `keys`

  type: `string[]`

  The keys to omit.

- ### `option`

  type: `object`

  - #### `arrayIndex`

    type: `"dot" | "bracket"`

    default: `"bracket"`

    The index of array to omit.

    e.g.
    `[ "a[0]" ]` will omit to `{ a: ["b"] }` if `arrayIndex` is `"bracket"`,
    and `[ "a.0" ]` will omit to `{ a: { 0: "b" } }` if `arrayIndex` is `"dot"`.

### Example

```ts
import { omit } from 'json-origami';

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

const omitted = omit(user, ['id', 'name', 'address.street', 'address.city']);
/**
 * {
 *   age: 20,
 *   address: {
 *     state: 'NY',
 *     zip: '10001',
 *   },
 * }
 */
```
