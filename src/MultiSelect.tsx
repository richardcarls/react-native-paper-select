import * as React from 'react';

import { View, Keyboard, Platform } from 'react-native';

import { TextInputAnchor } from './TextInputAnchor';
import { DropdownMenu } from './DropdownMenu';
import { ModalMenu } from './ModalMenu';

import { optionCompare, defaultValueFn, defaultLabelFn } from './util';

export type PaperSelectOption = {
  value: string;
  label: string;
};

export type MultiSelectProps<T> = {
  multi: true;

  // renderInput?: 'text' | 'button' | 'chips' | (() => React.ReactElement);
  renderInput?: 'text';

  // renderMenu?: 'modal' | 'dropdown' | false | (() => React.ReactElement);
  renderMenu?: 'modal' | 'dropdown' | false;

  /** The value to display in the component */
  value?: T[];

  defaultValue?: T[];

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

  /**
   * Callback that is called when the component's selection changes.
   *
   * The selected option is passed as an argument.
   */
  onSelection?: (selected: T[] | undefined) => void;

  valueFn?: (option: T) => string;

  labelFn?: (option: T) => string;

  // TODO: onSelectionCommit

  /** testID to be used on tests. */
  testID?: string;
};

export const MultiSelect = <T extends unknown>(props: MultiSelectProps<T>) => {
  const {
    value: otherValue,
    defaultValue,
    onSelection,

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
    T[] | undefined
  >(otherValue ?? defaultValue);

  // Use value from props instead of local state when input is controlled
  const isControlled = otherValue !== undefined;
  let value = isControlled ? otherValue : uncontrolledValue;

  const [menuVisible, setMenuVisible] = React.useState(false);

  const getTextValue = React.useCallback(() => {
    return value ? value.map((val) => valueFn(val)).join(', ') : '';
  }, [value, valueFn]);

  const clearSelection = () => {
    // Keep track of value in local state when input is not controlled
    if (!isControlled) {
      setUncontrolledValue(undefined);
    }

    onSelection && onSelection(undefined);
    setMenuVisible(false);
  };

  const selectOption = (selected: T) => {
    // Already selected
    if (value?.some((val) => optionCompare(val, selected))) {
      return setMenuVisible(false);
    }

    const valid = options?.some((option) => optionCompare(option, selected));

    if (valid) {
      const newValue = options?.filter(
        (option) =>
          value?.some((val) => optionCompare(val, option)) ||
          optionCompare(selected, option)
      );

      // Keep track of value in local state when input is not controlled
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }

      onSelection && onSelection(newValue);
      setMenuVisible(false);
    }
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
          onSelection={selectOption}
          onClear={clearSelection}
          onDismiss={() => setMenuVisible(false)}
          valueFn={valueFn}
          labelFn={labelFn}
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
            onSelection={selectOption}
            onClear={clearSelection}
            onDismiss={() => setMenuVisible(false)}
            valueFn={valueFn}
            labelFn={labelFn}
            testID={testID ? `${testID}-modal` : undefined}
          />
          {Anchor}
        </>
      ) : null}
    </View>
  );
};

export default MultiSelect;
