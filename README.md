# @rcarls/react-native-paper-select

A select-like input component for projects leveraging [react-native-paper](https://reactnativepaper.com/).

## What can it do?

- Single or multi-select input that supports `undefined` value
- Can be a controlled or uncontrolled input
- Easy to use with sensible defaults, react-native-paper theme support
- Accepts a render function for custom components
- Has `dropdown` or `modal` menu variants
  - Default: `modal` in mobile environments, otherwise `dropdown`
- Options can be any collection, or simply an array of strings. For collections:
  - Default: Use `value`, `key` or `id` keys for option values
  - Default: Use `label` key for option label
  - Also accepts functions to map options to values and labels
- `value` can be `undefined` with clear selection support

## Dependencies

- react-native
- react-native-vector-icons
- react-native-paper

## Installation

```sh
npm install @rcarls/react-native-paper-select
```

or

```sh
yarn add @rcarls/react-native-paper-select
```

## Usage

```js
import * as React from 'react';
import { PaperSelect } from '@rcarls/react-native-paper-select';

const options = ['one', 'two', 'three'];

const MyComponent = () => {
  const [value, setValue] = React.useState('');

  return (
    <PaperSelect
      label="Example"
      options={options}
      onSelection={(option) => setValue(option)}
    />
  );
};

export default MyComponent;
```

## Try it out

You can run the example module by performing these steps:

```sh
yarn && yarn example web
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
