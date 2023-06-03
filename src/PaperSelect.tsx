import * as React from 'react';

import { Keyboard, Platform } from 'react-native';

import { TextInputAnchor } from './TextInputAnchor';
import { DropdownMenu } from './DropdownMenu';
import { ModalMenu } from './ModalMenu';

import { optionCompare, objectGetProperty } from './util';

export type PaperSelectOption = {
  value: string;
  label: string;
};

export type PaperSelectProps<T extends NonNullable<any>> = {
  // TODO: multi

  // renderInput?: 'text' | 'button' | 'chips' | (() => React.ReactElement);
  renderInput?: 'text';

  // renderMenu?: 'modal' | 'dropdown' | false | (() => React.ReactElement);
  renderMenu?: 'modal' | 'dropdown' | false;

  /** The value to display in the component */
  value?: T;

  defaultValue?: T;

  /** Array of options data */
  options?: ReadonlyArray<T>;

  label?: string;

  // TODO: nullable

  /** Use error styles on the component */
  error?: boolean;

  // TODO: editable

  disabled?: boolean;

  /**
   * Label to use for the optional "none" option (sets value to `undefined`)
   *
   * @defaultValue '(None)'
   */
  noneLabel?: String;

  /**
   * Callback that is called when the component's selection changes.
   *
   * The selected option is passed as an argument.
   */
  onSelection?: (selected: T | undefined) => void;

  /**
   * Returns a value and label for the given option
   *
   * @param option - The option to derive a value and label from
   *
   * @defaultValue
   * When not defined:
   * - If option is a string, it's value is also used for the label; otherwise
   * - The values of the `value` and `label` properties, if they exist; otherwise
   * - The option is coersed to a string via `String()`
   */
  extractorFn?: (option: T) => PaperSelectOption;

  // TODO: onSelectionCommit

  /** testID to be used on tests. */
  testID?: string;
};

/**
 * A component that allows users to make a selection from a list of options
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { PaperSelect } from 'react-native-paper-select';
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
export const PaperSelect = <T extends NonNullable<any>>(
  props: PaperSelectProps<T>
) => {
  const {
    renderInput = 'text',
    // TODO: If undefined, select based on OS env (and if renderInput is not 'chips')
    renderMenu = Platform.OS === 'web' && 'document' in global
      ? 'dropdown'
      : 'modal',
    value: otherValue,
    defaultValue,
    options,
    label,
    error = false,
    disabled = false,
    noneLabel = '(None)',
    onSelection,
    extractorFn = defaultExtractorFn,
    testID,
  } = props;

  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    T | undefined
  >(otherValue ?? defaultValue);

  // Use value from props instead of local state when input is controlled
  const isControlled = otherValue !== undefined;
  const value = isControlled ? otherValue : uncontrolledValue;

  const [selected, setSelected] = React.useState<T | undefined>(() => {
    if (value === undefined) {
      return value;
    }

    return options?.some((option) => optionCompare(option, value))
      ? value
      : undefined;
  });
  const [menuVisible, setMenuVisible] = React.useState(false);

  // TODO: Better keyboard accessibility? (ie: up/down traversal, space open/select, esc close, etc.)

  const onSelectionConfirmed = (selection: T | undefined) => {
    setSelected(selection);

    if (!isControlled) {
      // Keep track of value in local state when input is not controlled
      setUncontrolledValue(value);
    }

    onSelection && onSelection(selection);
    setMenuVisible(false);
  };

  const openMenu = React.useCallback(() => {
    if (renderMenu && !disabled) {
      // Close keyboard to make best use of screen space
      Keyboard.dismiss();

      setMenuVisible(true);
    }
  }, [renderMenu, disabled]);

  const Anchor = (
    <>
      {renderInput === 'text' ? (
        <TextInputAnchor
          active={menuVisible}
          label={label}
          value={selected ? extractorFn(selected).label : ''}
          onPress={() => openMenu()}
          disabled={disabled}
          error={error}
        />
      ) : null}
    </>
  );

  return (
    <>
      {renderMenu === 'dropdown' ? (
        <DropdownMenu
          options={options}
          selected={selected}
          visible={menuVisible}
          noneLabel={noneLabel}
          extractorFn={extractorFn}
          onSelection={onSelectionConfirmed}
          onDismiss={() => setMenuVisible(false)}
          testID={testID ? `${testID}-dropdown` : undefined}
        >
          {Anchor}
        </DropdownMenu>
      ) : null}

      {renderMenu === 'modal' ? (
        <>
          <ModalMenu
            options={options}
            selected={selected}
            visible={menuVisible}
            label={label}
            extractorFn={extractorFn}
            onSelection={onSelectionConfirmed}
            onDismiss={() => setMenuVisible(false)}
            testID={testID ? `${testID}-modal` : undefined}
          />
          {Anchor}
        </>
      ) : null}
    </>
  );
};

export default PaperSelect;

const defaultExtractorFn = <T extends NonNullable<any>>(option?: T) => {
  if (option === undefined) {
    return { value: undefined, label: undefined };
  }

  if (typeof option === 'string') {
    return { value: option, label: option };
  }

  let label, value;
  if (typeof option === 'object' && option !== null) {
    value =
      objectGetProperty(option, 'value') ||
      objectGetProperty(option, 'id') ||
      objectGetProperty(option, 'key');

    label = objectGetProperty(option, 'label');
  }

  value = value ?? String(option);

  return {
    label: label ?? value,
    value,
  };
};
