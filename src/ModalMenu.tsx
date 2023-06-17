import * as React from 'react';

import {
  StyleSheet,
  type TextStyle,
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

import { ListItem } from './ListItem';
import { optionCompare } from './util';

export type ModalMenuProps<T extends NonNullable<any>> = {
  options?: ReadonlyArray<T>;
  selected?: T | T[];

  visible?: boolean;
  label?: string;

  valueFn: (option: T) => string;
  labelFn: (option: T) => string;
  select?: (option: T) => void;
  deselect?: (option: T) => void;
  clearSelected?: () => void;
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
    valueFn,
    labelFn,
    select,
    deselect,
    clearSelected,
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
      modalFooter: {
        flexDirection: 'row-reverse',
        marginTop: 16,
      },
    });
  }, [paperTheme, dimensions]);

  // Renders FlatList items for each option in `modal` mode
  const renderModalItem = ({ item: option }: ListRenderItemInfo<T>) => {
    const isSelected = Array.isArray(selected)
      ? selected.some((opt) => optionCompare(option, opt))
      : optionCompare(option, selected);

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
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        <Text variant="bodyMedium" style={labelStyle}>
          {labelFn(option)}
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
            keyExtractor={valueFn}
            renderItem={renderModalItem}
            ItemSeparatorComponent={Divider}
            accessibilityRole="list"
          />
        </View>

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
      </Modal>
    </Portal>
  );
};

export default ModalMenu;
