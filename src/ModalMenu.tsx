import * as React from 'react';

import {
  StyleSheet,
  type TextStyle,
  type ViewStyle,
  View,
  FlatList,
  type ListRenderItemInfo,
  useWindowDimensions,
} from 'react-native';

import {
  useTheme,
  Text,
  Divider,
  Button,
  Portal,
  Modal,
} from 'react-native-paper';

import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { ListItem } from './ListItem';
import { optionCompare } from './util';

type MenuLayout = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type ModalMenuProps<T extends NonNullable<any>> = {
  options?: ReadonlyArray<T>;
  selected?: T | T[];

  visible?: boolean;

  /**
   * Label to use for the optional "none" option (sets value to `undefined`)
   *
   * @defaultValue '(None)'
   */
  noneOption?: string | false;

  label?: string;
  checkboxes?: boolean;
  mode?: 'modal' | 'dropdown';

  valueFn: (option: T) => string;
  labelFn: (option: T) => string;
  select?: (option: T) => void;
  deselect?: (option: T) => void;
  clearSelected?: () => void;
  onDismiss?: () => void;

  /** testID to be used on tests. */
  testID?: string;
} & React.PropsWithChildren;

export const ModalMenu = <T extends NonNullable<any>>(
  props: ModalMenuProps<T>
) => {
  const {
    options,
    selected,
    visible = false,
    noneOption,
    label,
    checkboxes = false,
    mode = 'modal',
    valueFn,
    labelFn,
    select,
    deselect,
    clearSelected,
    onDismiss,
    children,
    testID,
  } = props;

  const anchorRef = React.useRef<View>(null);
  const portalRef = React.useRef<View>(null);
  const [menuLayout, setMenuLayout] = React.useState<MenuLayout | undefined>();
  const deferredMenuLayout = React.useDeferredValue(menuLayout);

  const paperTheme = useTheme();

  const dimensions = useWindowDimensions();

  // Measure ideal menu layout relative to portal
  const layoutMenu = React.useCallback(() => {
    if (portalRef.current !== null) {
      anchorRef.current?.measureLayout(
        portalRef.current,
        (left, top, width, height) =>
          setMenuLayout({
            left,
            top,
            width,
            height,
          }),

        // onFail
        () => {
          // TODO: measureInWindow won't account for scrolling position
          anchorRef.current?.measureInWindow((x, y, width, height) => {
            setMenuLayout({
              left: x,
              top: y,
              width,
              height,
            });
          });
        }
      );
    }
  }, [anchorRef, portalRef]);

  // Handle menu layout changes due to changing window dimensions
  // TODO: also on menu visible: measureLayout not working on mobile...
  React.useLayoutEffect(layoutMenu, [visible, dimensions, layoutMenu]);

  const styles = React.useMemo(() => {
    return StyleSheet.create({
      modalWrapper: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
      },
      dropdownStyle: {
        paddingVertical: 8,
        backgroundColor: paperTheme.colors.surface,
        borderBottomStartRadius: 4,
        borderBottomEndRadius: 4,
        elevation: 3,
      },
      noneOptionText: {
        fontStyle: 'italic',
        color: paperTheme.colors.onSurfaceDisabled,
      },
      // TODO: position relative to window in center, set max height
      modalStyle: {
        flexGrow: 0,
        alignSelf: 'center',
        margin: 24,
        padding: 24,
        backgroundColor: paperTheme.colors.surface,
        borderRadius: 28,
        elevation: 3,
      },
      modalHeader: {
        marginBottom: 16,
        color: paperTheme.colors.onSurface,
      },
      modalFooter: {
        flexDirection: 'row-reverse',
        marginTop: 16,
      },
    });
  }, [paperTheme]);

  // Renders FlatList items for each option in `modal` mode
  const renderModalItem = ({ item: option }: ListRenderItemInfo<T>) => {
    const isSelected = Array.isArray(selected)
      ? selected.some((opt) => optionCompare(option, opt))
      : optionCompare(option, selected);

    const icon = checkboxes ? (
      isSelected ? (
        <Icon
          name="checkbox-marked"
          size={18}
          color={paperTheme.colors.primary}
        />
      ) : (
        <Icon
          name="checkbox-blank-outline"
          size={18}
          color={paperTheme.colors.onSurfaceVariant}
        />
      )
    ) : undefined;

    const labelStyle: TextStyle = {
      color: isSelected
        ? paperTheme.colors.primary
        : paperTheme.colors.onSurface,
    };

    return (
      <ListItem
        onPress={() =>
          isSelected ? deselect && deselect(option) : select && select(option)
        }
        leadingContent={icon}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        <Text variant="bodyMedium" style={labelStyle}>
          {labelFn(option)}
        </Text>
      </ListItem>
    );
  };

  const noneItem = (
    <ListItem onPress={clearSelected} accessibilityRole="button">
      <Text variant="bodyMedium" style={styles.noneOptionText}>
        {noneOption}
      </Text>
    </ListItem>
  );

  const modalHeader = (
    <>
      <Text variant="headlineSmall" style={styles.modalHeader}>
        {label}
      </Text>

      <Divider />
    </>
  );

  const modalFooter = (
    <>
      <Divider />

      <View style={styles.modalFooter}>
        <Button onPress={() => onDismiss && onDismiss()}>Ok</Button>
        <Button
          onPress={() => clearSelected && clearSelected()}
          textColor={paperTheme.colors.onSurfaceVariant}
        >
          Clear
        </Button>
      </View>
    </>
  );

  const modalStyle = React.useMemo(() => {
    return {
      position: 'relative',
      minWidth: 280,
      maxWidth: 560,
      minHeight: 280,
    } as ViewStyle;
  }, []);

  // Don't use memo with dimensions
  const modalListStyle = {
    flexShrink: 1,
    minHeight: mode === 'modal' ? dimensions.height / 4 : 'none',
    maxHeight: mode === 'modal' ? dimensions.height / 2 : 'none',
  } as ViewStyle;

  const dropdownStyle = React.useMemo(() => {
    return {
      position: 'absolute',
      top:
        deferredMenuLayout &&
        deferredMenuLayout.top + deferredMenuLayout.height,
      left: deferredMenuLayout?.left,
      width: deferredMenuLayout?.width ?? 'auto',
    } as ViewStyle;
  }, [deferredMenuLayout]);

  return (
    <>
      <Portal>
        <View
          ref={portalRef}
          pointerEvents="box-none"
          style={styles.modalWrapper}
          testID={testID ? `${testID}-wrapper` : undefined}
        >
          <Modal
            visible={visible}
            onDismiss={() => onDismiss && onDismiss()}
            contentContainerStyle={
              mode === 'modal'
                ? [styles.modalStyle, modalStyle]
                : [styles.dropdownStyle, dropdownStyle]
            }
            testID={testID}
          >
            {mode === 'modal' && label ? modalHeader : null}

            <View style={modalListStyle}>
              {mode === 'dropdown' && noneOption ? noneItem : null}

              <FlatList
                data={options}
                scrollEnabled={mode === 'modal'}
                keyExtractor={valueFn}
                renderItem={renderModalItem}
                ItemSeparatorComponent={Divider}
                accessibilityRole="list"
              />
            </View>

            {mode === 'modal' && label ? modalFooter : null}
          </Modal>
        </View>
      </Portal>

      <View ref={anchorRef} onLayout={layoutMenu}>
        {React.Children.only(children)}
      </View>
    </>
  );
};

export default ModalMenu;
