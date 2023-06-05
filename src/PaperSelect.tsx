import * as React from 'react';

import { View, Keyboard, Platform } from 'react-native';

import { TextInputAnchor } from './TextInputAnchor';
import { DropdownMenu } from './DropdownMenu';
import { ModalMenu } from './ModalMenu';

import { optionCompare, defaultValueFn, defaultLabelFn } from './util';

type PaperSelectCommonProps<T> = {
  /** Array of options data */
  options?: ReadonlyArray<T>;

  // TODO: options sort

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
  noneOption?: String | false;

  valueFn?: (option: T) => string;

  labelFn?: (option: T) => string;

  // TODO: onSelectionCommit

  /** testID to be used on tests. */
  testID?: string;
};

type PaperSingleSelectProps<T> = {
  multi?: false;

  // renderInput?: 'text' | 'button' | 'chips' | (() => React.ReactElement);
  renderInput?: 'text';

  // renderMenu?: 'modal' | 'dropdown' | false | (() => React.ReactElement);
  renderMenu?: 'modal' | 'dropdown' | false;

  /** The value to display in the component */
  value?: T;

  defaultValue?: T;

  /**
   * Callback that is called when the component's selection changes.
   *
   * The selected option is passed as an argument.
   */
  onSelection?: (selected: T | undefined) => void;
} & PaperSelectCommonProps<T>;

type PaperMultiSelectProps<T> = {
  multi: true;

  // renderInput?: 'text' | 'button' | 'chips' | (() => React.ReactElement);
  renderInput?: 'text';

  // renderMenu?: 'modal' | 'dropdown' | false | (() => React.ReactElement);
  renderMenu?: 'modal' | 'dropdown' | false;

  /** The value to display in the component */
  value?: T[];

  defaultValue?: T[];

  /**
   * Callback that is called when the component's selection changes.
   *
   * The selected option is passed as an argument.
   */
  onSelection?: (selected: T[] | undefined) => void;
} & PaperSelectCommonProps<T>;

export type PaperSelectProps<T> =
  | PaperSingleSelectProps<T>
  | PaperMultiSelectProps<T>;

function assertSingle<T>(
  props: PaperSelectProps<T>
): asserts props is PaperSingleSelectProps<T> {
  const valid =
    (!Object.hasOwn(props, 'multi') || props.multi === false) &&
    (props.value === undefined || !Array.isArray(props.value)) &&
    (props.defaultValue === undefined || !Array.isArray(props.defaultValue));

  if (!valid) {
    throw new TypeError(
      '`value` and `defaultValue` must not be arrays if defined without `multi`.'
    );
  }
}

function assertMulti<T>(
  props: PaperSelectProps<T>
): asserts props is PaperMultiSelectProps<T> {
  const valid =
    Object.hasOwn(props, 'multi') &&
    props.multi === true &&
    (props.value === undefined || Array.isArray(props.value)) &&
    (props.defaultValue === undefined || Array.isArray(props.defaultValue));

  if (!valid) {
    throw new TypeError(
      '`value` and `defaultValue` must be arrays if defined with `multi`.'
    );
  }
}

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
  const {
    multi = false,
    value: otherValue,
    defaultValue,

    renderInput = 'text',
    // TODO: If undefined, select based on OS env (and if renderInput is not 'chips')
    renderMenu = Platform.OS === 'web' && 'document' in global
      ? 'dropdown'
      : 'modal',
    options,
    label,
    error = false,
    disabled = false,
    noneOption = '(None)',
    valueFn = defaultValueFn,
    labelFn = defaultLabelFn,
    testID,
  } = props;

  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    T | T[] | undefined
  >(otherValue ?? defaultValue);

  // Use value from props instead of local state when input is controlled
  const isControlled = otherValue !== undefined;
  const value = isControlled ? otherValue : uncontrolledValue;

  const [menuVisible, setMenuVisible] = React.useState(false);

  const getTextValue = React.useCallback(() => {
    if (multi) {
      return value ? (value as T[]).map((val) => valueFn(val)).join(', ') : '';
    } else {
      return value ? valueFn(value as T) : '';
    }
  }, [multi, value, valueFn]);

  const clearSelection = () => {
    // Keep track of value in local state when input is not controlled
    if (!isControlled) {
      setUncontrolledValue(undefined);
    }

    if (multi) {
      assertMulti(props);
      props.onSelection && props.onSelection(undefined);
    } else {
      assertSingle(props);
      props.onSelection && props.onSelection(undefined);
    }
    setMenuVisible(false);
  };

  const selectOption = (selected: T) => {
    // Already selected
    if (optionCompare(value, selected)) {
      return;
    }

    const valid = options?.some((option) => optionCompare(option, selected));

    if (valid) {
      if (multi) {
        assertMulti(props);

        const newValue = options?.filter(
          (option) =>
            (value as T[] | undefined)?.some((val) =>
              optionCompare(val, option)
            ) || optionCompare(selected, option)
        );

        // Keep track of value in local state when input is not controlled
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }

        props.onSelection && props.onSelection(newValue as T[] | undefined);
      } else {
        assertSingle(props);

        // Keep track of value in local state when input is not controlled
        if (!isControlled) {
          setUncontrolledValue(selected);
        }

        props.onSelection && props.onSelection(selected);

        // Close menu on selection with single select
        setMenuVisible(false);
      }
    }
  };

  const openMenu = React.useCallback(() => {
    if (renderMenu && !disabled) {
      // Close keyboard to make best use of screen space
      Keyboard.dismiss();

      setMenuVisible(true);
    }
  }, [renderMenu, disabled]);

  const onDismiss = React.useCallback(() => {
    setMenuVisible(false);
  }, []);

  const Anchor = (
    <>
      {renderInput === 'text' ? (
        <TextInputAnchor
          active={menuVisible}
          label={label}
          value={getTextValue()}
          onPress={() => openMenu()}
          disabled={disabled}
          error={error}
          testID={testID ? `${testID}-anchor` : undefined}
        />
      ) : null}
    </>
  );

  return (
    <View
      accessible={true}
      accessibilityRole="combobox"
      accessibilityLabel={label}
      accessibilityValue={{ text: getTextValue() }}
      accessibilityState={{ disabled, expanded: menuVisible }}
      testID={testID}
    >
      {renderMenu === 'dropdown' ? (
        <DropdownMenu
          options={options}
          selected={value}
          visible={menuVisible}
          noneOption={noneOption}
          valueFn={valueFn}
          labelFn={labelFn}
          onSelection={selectOption}
          onClear={clearSelection}
          onDismiss={onDismiss}
          testID={testID ? `${testID}-dropdown` : undefined}
        >
          {Anchor}
        </DropdownMenu>
      ) : null}

      {renderMenu === 'modal' ? (
        <>
          <ModalMenu
            options={options}
            selected={value}
            visible={menuVisible}
            label={label}
            valueFn={valueFn}
            labelFn={labelFn}
            onSelection={selectOption}
            onClear={clearSelection}
            onDismiss={onDismiss}
            testID={testID ? `${testID}-modal` : undefined}
          />
          {Anchor}
        </>
      ) : null}
    </View>
  );
};

export default PaperSelect;
