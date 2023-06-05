import * as React from 'react';

import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { useTheme, Menu, Divider } from 'react-native-paper';

import { optionCompare } from './util';

export type DropdownMenuProps<T extends NonNullable<any>> = {
  options?: ReadonlyArray<T>;
  selected?: T | T[];
  visible?: boolean;

  /**
   * Label to use for the optional "none" option (sets value to `undefined`)
   *
   * @defaultValue '(None)'
   */
  noneOption?: String | false;

  valueFn: (option: T) => string;
  labelFn: (option: T) => string;

  onSelection?: (option: T) => void;
  onClear?: () => void;
  onDismiss?: () => void;

  /** testID to be used on tests. */
  testID?: string;
} & React.PropsWithChildren;

export const DropdownMenu = <T extends NonNullable<any>>(
  props: DropdownMenuProps<T>
) => {
  const {
    options,
    selected,
    visible = false,
    noneOption,
    valueFn,
    labelFn,
    onSelection,
    onClear,
    onDismiss,
    children,
    testID,
  } = props;

  const [menuWidth, setMenuWidth] = React.useState<number | undefined>(
    undefined
  );

  const paperTheme = useTheme();

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

  // Size menu width to match anchor in `dropdown` mode
  const onLayout = React.useCallback((e: LayoutChangeEvent) => {
    setMenuWidth(e.nativeEvent.layout.width);
  }, []);

  // Renders Menu.Items for each option (and none option) in `dropdown' mode
  const renderMenuOptions = () => {
    const items: JSX.Element[] = [];

    if (noneOption) {
      items.push(
        <React.Fragment key="none">
          <Menu.Item
            title={noneOption}
            onPress={() => onClear && onClear()}
            titleStyle={styles.noneOptionText}
            testID={testID ? `${testID}-none` : undefined}
          />
          {options && options.length ? <Divider /> : null}
        </React.Fragment>
      );
    }

    if (options === undefined || options.length === 0) {
      return items;
    }

    // TODO: Set menuWidth based on longest menu item somehow instead of anchor
    // Constrain Item text to menu width
    const maxWidth = menuWidth
      ? menuWidth - (paperTheme.isV3 ? 12 : 8) * 2
      : undefined;

    for (let i = 0; i < options.length; i++) {
      const option = options[i]!!;
      const isSelected = Array.isArray(selected)
        ? selected.some((opt) => optionCompare(option, opt))
        : optionCompare(option, selected);

      items.push(
        <React.Fragment key={valueFn(option)}>
          <Menu.Item
            title={labelFn(option)}
            onPress={() => onSelection && onSelection(option)}
            titleStyle={{
              color: isSelected
                ? paperTheme.colors.primary
                : paperTheme.colors.onSurface,
            }}
            contentStyle={{ maxWidth }}
            testID={testID ? `${testID}-option-${valueFn(option)}` : undefined}
          />
          {i < options.length - 1 ? <Divider /> : null}
        </React.Fragment>
      );
    }

    return items;
  };

  const Anchor = (
    <View onLayout={(e) => onLayout(e)} accessibilityRole="list">
      <View onLayout={(e) => onLayout(e)}>{React.Children.only(children)}</View>
    </View>
  );

  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      anchor={Anchor}
      anchorPosition="bottom"
      style={styles.menuContainer}
      contentStyle={styles.menu}
      testID={testID}
    >
      {renderMenuOptions()}
    </Menu>
  );
};

export default DropdownMenu;
