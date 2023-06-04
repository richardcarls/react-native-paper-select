# @rcarls/react-native-paper-select

A select-like dropdown input component for projects leveraging [react-native-paper](https://reactnativepaper.com/).

## What can it do?

- Renders as a react-native-paper `TextInput` with an indicator arrow
- Single-select via a `dropdown` or `modal` menu variant
  - Default: `modal` in mobile environments, otherwise `dropdown`
- Options can be any collection or array of strings
  - Default: Use `value`, `key` or `id` keys for option values
  - Default: Use `label` key for option label
- Accepts a function to map options to values and labels
- Uses current react-native-paper `ThemeContext` to fit your app theme

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
