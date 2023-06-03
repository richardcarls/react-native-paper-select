import * as React from 'react';

import {
  StyleSheet,
  TextStyle,
  View,
  FlatList,
  ListRenderItemInfo,
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

import type { PaperSelectOption } from './PaperSelect';
import { ListItem } from './ListItem';
import { optionCompare } from './util';

export type ModalMenuProps<T extends NonNullable<any>> = {
  options?: ReadonlyArray<T>;
  selected?: T;

  visible?: boolean;
  label?: string;

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
  extractorFn: (option: T) => PaperSelectOption;

  onSelection?: (option?: T) => void;
  onDismiss?: () => void;

  /** testID to be used on tests. */
  testID?: string;
};

export const ModalMenu = <T extends NonNullable<any>>(
  props: ModalMenuProps<T>
) => {
  const {
    options,
    selected,
    visible = false,
    label,
    extractorFn,
    onSelection,
    onDismiss,
    testID,
  } = props;

  const paperTheme = useTheme();

  const dimensions = useWindowDimensions();

  const styles = React.useMemo(() => {
    return StyleSheet.create({
      modalStyle: {
        flexGrow: 0,
        alignSelf: 'center',
        margin: 24,
        padding: 24,
        minWidth: 280,
        maxWidth: 560,
        minHeight: 280,
        backgroundColor: paperTheme.colors.surface,
        borderRadius: 28,
        elevation: 3,
      },
      modalHeadline: {
        marginBottom: 16,
        color: paperTheme.colors.onSurface,
      },
      modalListContainer: {
        flexShrink: 1,
        minHeight: dimensions.height / 4,
        maxHeight: dimensions.height / 2,
      },
      modalClearButton: {
        marginTop: 16,
      },
    });
  }, [paperTheme, dimensions]);

  // Renders FlatList items for each option in `modal` mode
  const renderModalItem = ({ item: option }: ListRenderItemInfo<T>) => {
    const { label: optionLabel } = extractorFn(option);
    const isSelected = optionCompare(option, selected);

    const labelStyle: TextStyle = {
      color: isSelected
        ? paperTheme.colors.primary
        : paperTheme.colors.onSurface,
    };

    return (
      <ListItem
        onPress={() => onSelection && onSelection(option)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        <Text variant="bodyMedium" style={labelStyle}>
          {optionLabel}
        </Text>
      </ListItem>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => onDismiss && onDismiss()}
        contentContainerStyle={styles.modalStyle}
        testID={testID}
      >
        {label ? (
          <Text variant="headlineSmall" style={styles.modalHeadline}>
            {label}
          </Text>
        ) : null}

        <Divider />

        <View style={styles.modalListContainer}>
          <FlatList
            data={options}
            keyExtractor={(option) => extractorFn(option).value}
            renderItem={renderModalItem}
            ItemSeparatorComponent={Divider}
            accessibilityRole="list"
          />
        </View>

        <Divider />

        <Button
          onPress={() => onSelection && onSelection(undefined)}
          style={styles.modalClearButton}
        >
          Clear
        </Button>
      </Modal>
    </Portal>
  );
};

export default ModalMenu;
