import * as React from 'react';

import { View, Keyboard, Platform, type ViewProps } from 'react-native';

import { TextInputAnchor } from './TextInputAnchor';
import { ModalMenu } from './ModalMenu';

import { optionCompare, defaultValueFn, defaultLabelFn } from './util';

/** State object for `renderFn` callback */
type PaperSelectCommonState<T> = {
  /** Indicates wether the menu is open or not */
  readonly active: boolean;

  /** Opens the menu */
  readonly openMenu: () => void;

  /** Closes the menu */
  readonly closeMenu: () => void;

  /** Clears the current selection (sets to `undefined`) */
  readonly clearSelected: () => void;

  /**
   * Selects an option
   *
   * @param selected the option to select
   */
  readonly select: (selected: T) => void;

  /**
   * Deselects an option
   *
   * @param deselected the option to deselect
   */
  readonly deselect: (deselected: T) => void;
};

/** State object for `renderFn` callback on a single-select */
export type PaperSelectSingleState<T> = {
  /** The current selection. */
  readonly selected?: T;
} & PaperSelectCommonState<T>;

/** State object for `renderFn` callback on a multi-select */
export type PaperSelectMultiState<T> = {
  /** The current selection. */
  readonly selected?: T[];
} & PaperSelectCommonState<T>;

/** Shared props for single/multi select */
type PaperSelectCommonProps<T> = {
  /** Array of options */
  readonly options?: T[];

  // TODO: options sort

  /** The label for this input. Not used if `renderFn` is supplied. */
  readonly label?: string;

  // TODO: nullable

  /**
   * Use error styles on the component
   *
   * Not used if `renderFn` is supplied.
   *
   * @defaultValue false
   */
  error?: boolean;

  // TODO: editable

  /**
   * Disables interactivity and uses disabled styles. Not used if `renderFn` is supplied.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean;

  /**
   * Specifies how the select menu is rendered
   *
   * @defaultValue 'dropdown' for web, 'modal' for other environements, or if `renderFn` is defined
   */
  readonly renderMenu?: 'modal' | 'dropdown' | false;

  /**
   * Label to use for the optional "none" option (sets value to `undefined`)
   *
   * @defaultValue '(None)'
   */
  readonly noneOption?: string | false;

  /**
   * Callback to extract a value from an option
   *
   * If not specified, a default implementation is used:
   * - If option is a string, it's value is returned; otherwise
   * - If option is an object with either `value`, `key` or `id` keys, it's value is returned; otherwise
   * - Option is coerced into a string and returned
   *
   * @param option the option to derive an option value from
   * @returns value for the option
   */
  readonly valueFn?: (option: Readonly<T>) => string;

  /**
   * Callback to extract a label from an option
   *
   * If not specified, a default implementation is used:
   * - If option is a string, it's value is returned; otherwise
   * - If option is an object with a `label` key, it's value is returned; otherwise
   * - Option is coerced into a string and returned
   *
   * @param option the option to derive an option label from
   * @returns label for the option
   */
  readonly labelFn?: (option: Readonly<T>) => string;

  // TODO: onSelectionCommit
} & Omit<ViewProps, 'children'>;

/** Props for single-select */
type PaperSingleSelectProps<T> = {
  /**
   * Specifies if this select permits multiple selection
   *
   * @defaultValue false
   */
  readonly multi?: false;

  /** The value to display in the component */
  value?: T;

  /**
   * Default selection value to display
   */
  readonly defaultValue?: T;

  /**
   * Callback that is called when the component's selection changes.
   *
   * @param option the selected option
   */
  readonly onSelection?: (option: Readonly<T> | undefined) => void;

  /**
   * Render a custom component instead of the default `TextInput` implementation
   *
   * @param state current state and callback funtions to use in a custom implementation
   * @returns the rendered anchor element
   */
  readonly renderFn?: (state: PaperSelectSingleState<T>) => React.ReactElement;
} & PaperSelectCommonProps<T>;

/** Props for multi-select */
type PaperMultiSelectProps<T> = {
  /**
   * Specifies if this select permits multiple selection
   *
   * @defaultValue false
   */
  readonly multi: true | 'checkboxes';

  /** The value to display in the component */
  value?: T[];

  /**
   * Default selection value to display
   */
  readonly defaultValue?: T[];

  /**
   * Callback that is called when the component's selection changes.
   *
   * @param options the selected options
   */
  readonly onSelection?: (options: Readonly<T>[] | undefined) => void;

  /**
   * Render a custom component instead of the default `TextInput` implementation
   *
   * @param state current state and callback funtions to use in a custom implementation
   * @returns the rendered anchor element
   */
  readonly renderFn?: (state: PaperSelectMultiState<T>) => React.ReactElement;
} & PaperSelectCommonProps<T>;

/** Props for PaperSelect component */
export type PaperSelectProps<T> =
  | PaperMultiSelectProps<T>
  | PaperSingleSelectProps<T>;

/** Assertion function for narrowing single-select prop types */
function assertSingle<T>(
  props: any
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

/** Assertion function for narrowing multi-select prop types */
function assertMulti<T>(
  props: PaperSelectProps<T>
): asserts props is PaperMultiSelectProps<T> {
  const valid =
    Object.hasOwn(props, 'multi') &&
    (props.multi === true || props.multi === 'checkboxes') &&
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
export const PaperSelect = <T extends NonNullable<any>>(
  props: PaperSelectProps<T>
) => {
  const {
    multi = false,
    value: otherValue,
    defaultValue,

    options,
    label,
    error = false,
    disabled = false,
    noneOption = '(None)',
    renderMenu = Platform.OS === 'web' &&
    'document' in global &&
    props.renderFn === undefined
      ? 'dropdown'
      : 'modal',
    valueFn = defaultValueFn,
    labelFn = defaultLabelFn,
    testID,

    ...viewProps
  } = props;

  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    otherValue ?? defaultValue
  );

  // Use value from props instead of local state when input is controlled
  const isControlled = otherValue !== undefined;
  const value = isControlled ? otherValue : uncontrolledValue;

  const [menuVisible, setMenuVisible] = React.useState(false);

  const getValue = React.useCallback(() => {
    if (multi) {
      return value ? (value as T[]).map((val) => valueFn(val)).join(', ') : '';
    } else {
      return value ? valueFn(value as T) : '';
    }
  }, [multi, value, valueFn]);

  const getLabel = React.useCallback(() => {
    if (multi) {
      return value ? (value as T[]).map((val) => labelFn(val)).join(', ') : '';
    } else {
      return value ? labelFn(value as T) : '';
    }
  }, [multi, value, labelFn]);

  const clearSelected = () => {
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

  const select = (selected: T) => {
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

  const deselect = (deselected: T) => {
    if (multi) {
      assertMulti(props);

      const newValue = (value as T[] | undefined)?.filter(
        (val) => !optionCompare(val, deselected)
      );

      // Keep track of value in local state when input is not controlled
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }

      props.onSelection && props.onSelection(newValue as T[] | undefined);
    } else {
      // no-op
    }
  };

  const openMenu = React.useCallback(() => {
    if (renderMenu && !disabled) {
      // Close keyboard to make best use of screen space
      Keyboard.dismiss();

      setMenuVisible(true);
    }
  }, [renderMenu, disabled]);

  const closeMenu = React.useCallback(() => {
    setMenuVisible(false);
  }, []);

  const renderAnchor = () => {
    if (props.renderFn === undefined) {
      return (
        <TextInputAnchor
          active={menuVisible}
          label={label}
          value={getLabel()}
          onPress={() => openMenu()}
          disabled={disabled}
          error={error}
          testID={testID ? `${testID}-anchor` : undefined}
        />
      );
    } else {
      if (multi) {
        assertMulti(props);

        return props.renderFn({
          active: menuVisible,
          selected: value as T[],
          openMenu,
          closeMenu,
          clearSelected,
          select,
          deselect,
        });
      } else {
        assertSingle(props);

        return props.renderFn({
          active: menuVisible,
          selected: value as T,
          openMenu,
          closeMenu,
          clearSelected,
          select,
          deselect,
        });
      }
    }
  };

  return (
    <View
      accessible={true}
      accessibilityRole="combobox"
      accessibilityLabel={label}
      accessibilityValue={{ text: getValue() }}
      accessibilityState={{ disabled, expanded: menuVisible }}
      testID={testID}
      {...viewProps}
    >
      {renderMenu === false ? (
        renderAnchor()
      ) : (
        <ModalMenu
          options={options}
          selected={value}
          visible={menuVisible}
          label={label}
          valueFn={valueFn}
          labelFn={labelFn}
          checkboxes={multi === 'checkboxes'}
          noneOption={noneOption}
          mode={renderMenu}
          select={select}
          deselect={deselect}
          clearSelected={clearSelected}
          onDismiss={closeMenu}
          testID={testID ? `${testID}-modal` : undefined}
        >
          {renderAnchor()}
        </ModalMenu>
      )}
    </View>
  );
};

export default PaperSelect;
