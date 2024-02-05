---
title: twist
description: twist function converts a JSON object into another JSON object by twisting it.
---

`twist` function converts a JSON object into another JSON object by twisting it.

```ts
twist(object, map, option?)
```

## Arguments

- ### `object`

  type: `object`

  The JSON object to twist.

- ### `map`

  type: `object`

  The map to twist the JSON object.

  e.g.
  `{ "a.b": "x.y" }` will twist `{ a: { b: "c" } }` to `{ x: { y: "c" } }`.

- ### `option`

  type: `object`

  - #### `arrayIndex`

    type: `"dot" | "bracket"`

    default: `"bracket"`

    The index of array to twist.

    e.g.
    `{ "a[0]": "x[0]" }` will twist `{ a: ["b"] }` to `{ x: ["b"] }` if `arrayIndex` is `"bracket"`,
    `{ "a.0": "x.0" }` will twist `{ a: ["b"] }` to `{ x: ["b"] }` if `arrayIndex` is `"dot"`.

  - #### `pruneArray`

    type: `boolean`

    default: `true`

    Whether to prune the array when twisting.

    e.g.
    `{ "a[0]": "x[1]" }` will twist `{ a: ["b"] }` to `{ x: [undefined, "b"] }` if `pruneArray` is `false`,
    `{ "a[0]": "x[1]" }` will twist `{ a: ["b"] }` to `{ x: ["b"] }` if `pruneArray` is `true`.

### Example

```ts
import { twist } from "json-origami";

const user = {
  id: 1,
  name: "John",
  age: 20,
  address: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001",
  },
};

const twisted = twist(user, {
  id: "userId",
  name: "userName",
  "address.state": "state",
  "address.street": "addressInfo.street",
  "address.city": "addressInfo.city",
  "address.zip": "addressInfo.zip",
  age: "profile.age",
});

/**
 * {
 *   userId: 1,
 *   userName: 'John',
 *   state: 'NY',
 *   profile: {
 *    age: 20,
 *   },
 *   addressInfo: {
 *     street: '123 Main St',
 *     city: 'New York',
 *     zip: '10001',
 *   },
 * }
 */
```

:w
