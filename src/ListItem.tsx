import React from 'react';

import {
  StyleSheet,
  View,
  ViewStyle,
  Pressable,
  PressableProps,
} from 'react-native';

export type ListItemVariants = 'one-line' | 'two-line' | 'three-line';

export type ListItemProps = {
  variant?: ListItemVariants;

  leadingContent?: JSX.Element | null;
  trailingContent?: JSX.Element | null;
} & Omit<PressableProps, 'style'>;

type ListItemStyles = {
  [key in ListItemVariants]: ViewStyle;
} & StyleSheet.NamedStyles<any>;

export const ListItem = ({ variant = 'one-line', ...props }: ListItemProps) => {
  const {
    onPress,
    children,
    trailingContent = null,
    leadingContent = null,

    ...pressableProps
  } = props;

  const commonStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingLeft: 16,
    paddingRight: 32,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const styles = StyleSheet.create<ListItemStyles>({
    'one-line': {
      ...commonStyle,
    },
    'two-line': {
      ...commonStyle,
      minHeight: 72,
    },
    'three-line': {
      ...commonStyle,
      minHeight: 88,
    },
    'leadingContent': {
      alignItems: 'center',
      justifyContent: variant === 'three-line' ? 'flex-start' : 'center',
      marginRight: 16,
      maxHeight: 56,
      overflow: 'hidden',
    },
    'mainContent': {
      flex: 1,
      flexGrow: 1,
    },
    'trailingContent': {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 16,
      maxHeight: 56,
      overflow: 'hidden',
    },
  });

  const item = (
    <View style={styles[variant]}>
      {leadingContent ? (
        <View style={styles.leadingContent}>{leadingContent}</View>
      ) : null}

      <View style={styles.mainContent}>
        <>{children ?? null}</>
      </View>

      {trailingContent ? (
        <View style={styles.trailingContent}>{trailingContent}</View>
      ) : null}
    </View>
  );

  if (onPress !== undefined) {
    return (
      <Pressable onPress={onPress} {...pressableProps}>
        {item}
      </Pressable>
    );
  } else {
    return item;
  }
};

export default ListItem;
