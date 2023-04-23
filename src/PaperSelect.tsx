import * as React from 'react';

import {
  StyleSheet,
  ViewProps,
  Keyboard,
  LayoutChangeEvent,
} from 'react-native';

import { useTheme, Menu, Divider } from 'react-native-paper';

import { TextInputAnchor } from './TextInputAnchor';

import { defaultLabelFn, defaultValueFn, optionCompare } from './util';

/**
 * Component props for `PaperSelect`
 *
 * @typeParam T - Option type
 */
export type PaperSelectProps<T extends unknown> = {
  // TODO: displayMode (ie: 'dropdown' for web, 'modal' for others)

  /** Array of options data */
  options?: T[];

  /** The value to display in the component */
  value?: T | undefined;

  defaultValue?: T | undefined;

  // TODO: nullable

  /** If true, user won't be able to interact with the component. */
  disabled?: boolean;

  /** Use error styles on the component */
  error?: boolean;

  /**
   * Returns a label for the given option
   *
   * @param option - The option to derive a label from
   *
   * @defaultValue
   * When not defined:
   * - If option is a string, it's value is also used for the label; otherwise
   * - The value of the `label` property, if it exists; otherwise
   * - The option coersed to a string via `String()`
   */
  labels?: (option: T) => string;

  /**
   * Returns a value for the given option
   *
   * @param option - The option to derive a value from
   *
   * @defaultValue
   * When not defined:
   * - If option is a string, it's value is also used for the selection value; otherwise
   * - The value of the `value` or `id` properties, if one exists; otherwise
   * - The option coersed to a string via `String()`
   */
  values?: (option: T) => string;

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

  // TODO: onSelectionCommit
} & Pick<ViewProps, 'onLayout'>;

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
export const PaperSelect = <T extends unknown>(props: PaperSelectProps<T>) => {
  const {
    options,
    value: otherValue,
    defaultValue,
    disabled = false,
    error = false,
    labels = defaultLabelFn,
    values = defaultValueFn,
    noneLabel = '(None)',
    onSelection,

    onLayout: otherOnLayout,
  } = props;

  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    T | undefined
  >(otherValue || defaultValue);

  // Use value from props instead of local state when input is controlled
  const isControlled = otherValue !== undefined;
  const value: Readonly<T | undefined> = isControlled
    ? otherValue
    : uncontrolledValue;

  const [selected, setSelected] = React.useState<T | undefined>(() => {
    if (value === undefined) {
      return value;
    }

    return options?.some((option) => optionCompare(option, value))
      ? value
      : undefined;
  });
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [menuWidth, setMenuWidth] = React.useState<number | undefined>(
    undefined
  );

  const paperTheme = useTheme();

  const openMenu = () => {
    if (!disabled) {
      // Close keyboard to make best use of screen space
      Keyboard.dismiss();

      setMenuVisible(true);
    }
  };

  // TODO: Better keyboard accessibility? (ie: up/down traversal, space open/select, esc close, etc.)

  const onOptionSelected = (option: T | undefined) => {
    setSelected(option);

    if (!isControlled) {
      // Keep track of value in local state when input is not controlled
      setUncontrolledValue(value);
    }

    onSelection && onSelection(option);
    setMenuVisible(false);
  };

  const onLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      setMenuWidth(e.nativeEvent.layout.width);

      otherOnLayout && otherOnLayout(e);
    },
    [otherOnLayout]
  );

  const styles = React.useMemo(() => {
    return StyleSheet.create({
      menuContainer: {
        width: menuWidth ? menuWidth : 'auto',
      },
      menu: {
        borderTopStartRadius: 0,
        borderTopEndRadius: 0,
      },
      noneOptionText: {
        fontStyle: 'italic',
        color: paperTheme.colors.onSurfaceDisabled,
      },
    });
  }, [paperTheme, menuWidth]);

  // The visible select component
  const Anchor = (
    <TextInputAnchor
      active={menuVisible}
      value={selected ? labels(selected) : ''}
      disabled={disabled}
      error={error}
      onPress={() => openMenu()}
      onLayout={(e) => onLayout(e)}
    />
  );

  // Renders Menu.Items for each option (and none option)
  const renderOptions = () => {
    const items: JSX.Element[] = [];

    if (noneLabel) {
      items.push(
        <React.Fragment key="none">
          <Menu.Item
            title={noneLabel}
            onPress={() => onOptionSelected(undefined)}
            titleStyle={styles.noneOptionText}
          />
          {options && options.length ? <Divider /> : null}
        </React.Fragment>
      );
    }

    if (options === undefined || options.length === 0) {
      return items;
    }

    for (let i = 0; i < options.length; i++) {
      const option = options[i]!!;

      items.push(
        <React.Fragment
          key={values !== undefined ? values(option) : i.toString()}
        >
          <Menu.Item
            title={labels(option)}
            onPress={() => onOptionSelected(option)}
            titleStyle={{
              color: optionCompare(option, selected)
                ? paperTheme.colors.primary
                : paperTheme.colors.onSurface,
            }}
          />
          {i < options.length - 1 ? <Divider /> : null}
        </React.Fragment>
      );
    }

    return items;
  };

  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={Anchor}
      anchorPosition="bottom"
      style={styles.menuContainer}
      contentStyle={styles.menu}
    >
      {renderOptions()}
    </Menu>
  );
};

export default PaperSelect;
