---
title: Getting Started
description: Getting started with json-origami library
---

## Install

### Node.js

```bash
npm install json-origami
```

### yarn

```bash
yarn add json-origami
```

### Usage

```ts
import { fold } from 'json-origami';
```

## Why json-origami?

json-origami is a library that allows you to fold and unfold JSON objects. It is useful when you want to transform JSON objects into other JSON objects.
It provides an intuitive API for converting JSON objects that is easy to understand and write.

### Converting Json like folding origami

`fold` function converts a JSON object into another JSON object by folding it.

```ts

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
 *   'address.zip': '10001',
 * }}
 */
```

`twist` function converts a JSON object into another JSON object by twisting it.

```ts
import { twist } from 'json-origami';

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

const map = {
  'address.street': 'street',
  'address.city': 'city',
  'address.state': 'state',
  'address.zip': 'zip',
};

const twisted = twist(user, map);
/**
 * {
 *   id: 1,
 *   name: 'John',
 *   age: 20,
 *   street: '123 Main St',
 *   city: 'New York',
 *   state: 'NY',
 *   zip: '10001',
 * }
 */
```
