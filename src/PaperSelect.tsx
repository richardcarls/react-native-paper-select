import * as React from 'react';

import { View, Keyboard, Platform, type ViewProps } from 'react-native';

import { TextInputAnchor } from './TextInputAnchor';
import { DropdownMenu } from './DropdownMenu';
import { ModalMenu } from './ModalMenu';

import { optionCompare, defaultValueFn, defaultLabelFn } from './util';

type PaperSelectCommonState<T> = {
  readonly active: boolean;
  readonly openMenu: () => void;
  readonly closeMenu: () => void;
  readonly clearSelected: () => void;
  readonly select: (selected: Readonly<T>) => void;
  readonly deselect: (deselected: Readonly<T>) => void;
};

export type PaperSelectSingleState<T> = {
  readonly selected?: Readonly<T>;
} & PaperSelectCommonState<T>;

export type PaperSelectMultiState<T> = {
  readonly selected?: Readonly<T>[];
} & PaperSelectCommonState<T>;

type PaperSelectCommonProps<T> = {
  /** Array of options data */
  readonly options?: T[];

  // TODO: options sort

  readonly label?: string;

  // TODO: nullable

  /** Use error styles on the component */
  error?: boolean;

  // TODO: editable

  readonly disabled?: boolean;

  readonly renderMenu?: 'modal' | 'dropdown' | false;

  /**
   * Label to use for the optional "none" option (sets value to `undefined`)
   *
   * @defaultValue '(None)'
   */
  readonly noneOption?: String | false;

  readonly valueFn?: (option: Readonly<T>) => string;

  readonly labelFn?: (option: Readonly<T>) => string;

  // TODO: onSelectionCommit
} & Omit<ViewProps, 'children'>;

type PaperSingleSelectProps<T> = {
  readonly multi?: false;

  /** The value to display in the component */
  value?: T;

  readonly defaultValue?: T;

  /**
   * Callback that is called when the component's selection changes.
   *
   * The selected option is passed as an argument.
   */
  readonly onSelection?: (selected: Readonly<T> | undefined) => void;

  readonly renderFn?: (state: PaperSelectSingleState<T>) => React.ReactElement;
} & PaperSelectCommonProps<T>;

type PaperMultiSelectProps<T> = {
  readonly multi: true;

  /** The value to display in the component */
  value?: T[];

  readonly defaultValue?: T[];

  /**
   * Callback that is called when the component's selection changes.
   *
   * The selected option is passed as an argument.
   */
  readonly onSelection?: (selected: Readonly<T>[] | undefined) => void;

  readonly renderFn?: (state: PaperSelectMultiState<T>) => React.ReactElement;
} & PaperSelectCommonProps<T>;

export type PaperSelectProps<T> =
  | PaperMultiSelectProps<T>
  | PaperSingleSelectProps<T>;

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
      {renderMenu === 'dropdown' ? (
        <DropdownMenu
          options={options}
          selected={value}
          visible={menuVisible}
          noneOption={noneOption}
          valueFn={valueFn}
          labelFn={labelFn}
          onSelect={select}
          onDeselect={deselect}
          onClear={clearSelected}
          onDismiss={closeMenu}
          testID={testID ? `${testID}-dropdown` : undefined}
        >
          {renderAnchor()}
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
            onSelect={select}
            onDeselect={deselect}
            onClear={clearSelected}
            onDismiss={closeMenu}
            testID={testID ? `${testID}-modal` : undefined}
          />
          {renderAnchor()}
        </>
      ) : null}
    </View>
  );
};

export default PaperSelect;
