import * as React from 'react';

import { SingleSelect, type SingleSelectProps } from './SingleSelect';
import { MultiSelect, type MultiSelectProps } from './MultiSelect';

export type PaperSelectProps<T> = SingleSelectProps<T> | MultiSelectProps<T>;

const isMulti = <T extends unknown>(
  props: PaperSelectProps<T>
): props is MultiSelectProps<T> => {
  return props.multi ?? false;
};

/**
 * A component that allows users to make a selection from a list of options
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { PaperSelect } from '@rcarls/react-native-paper-select';
 *
 * const options = ['one', 'two', 'three'];
 *
 * const MyComponent = () => {
 *   const [value, setValue] = React.useState('');
 *
 *   return (
 *     <PaperSelect
 *       label="Example"
 *       options={options}
 *       value={value}
 *       onSelection={(option) => setValue(option)}
 *     />
 *   );
 * };
 *
 * export default MyComponent;
 * ```
 */
export const PaperSelect = <T extends unknown>(props: PaperSelectProps<T>) => {
  return isMulti(props) ? (
    <MultiSelect {...props} />
  ) : (
    <SingleSelect {...props} />
  );
};

export default PaperSelect;
