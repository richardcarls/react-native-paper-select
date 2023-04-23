import * as React from 'react';

import {
  StyleSheet,
  View,
  ViewProps,
  Pressable,
  PressableProps,
  NativeSyntheticEvent,
  TargetedEvent,
} from 'react-native';

import { useTheme, TextInput, TextInputProps } from 'react-native-paper';

type SupportedPressableProps = Omit<PressableProps, 'children' | 'style'>;

// TODO: Support more TextInput props like 'mode'
type SupportedInputProps = Pick<
  TextInputProps,
  'value' | 'error' | 'disabled' | 'style'
>;

export type TextInputAnchorProps = {
  /** If true, style like an open select input */
  active?: boolean;

  /** Delegate wrapping View's `onLayout` for Menu sizing */
  onLayout?: ViewProps['onLayout'];
} & SupportedInputProps &
  SupportedPressableProps;

/**
 * Basically just a react-native-paper `TextInput` underneath a `Pressable`
 */
export const TextInputAnchor = (props: TextInputAnchorProps) => {
  const {
    active = false,
    onLayout,

    // TextInput props
    value,
    error,
    disabled,
    style: inputStyle,

    // Pressable props
    onFocus: otherOnFocus,
    onBlur: otherOnBlur,
    ...pressableProps
  } = props;

  // Keep track of Pressable focus to style underlying TextInput
  const [inputFocused, setInputFocused] = React.useState(false);

  const paperTheme = useTheme();

  const onFocus = (e: NativeSyntheticEvent<TargetedEvent>) => {
    setInputFocused(true);

    otherOnFocus && otherOnFocus(e);
  };

  const onBlur = (e: NativeSyntheticEvent<TargetedEvent>) => {
    setInputFocused(false);

    otherOnBlur && otherOnBlur(e);
  };

  const styles = React.useMemo(() => {
    return StyleSheet.create({
      pressable: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
      },
      textInput: {
        color: error ? paperTheme.colors.error : paperTheme.colors.onBackground,
      },
      textInputFocusUnderline: {
        transform: [{ scaleY: 2 }],
      },
    });
  }, [error, paperTheme]);

  return (
    <View onLayout={(e) => onLayout && onLayout(e)}>
      <Pressable
        onFocus={(e) => onFocus(e)}
        onBlur={(e) => onBlur(e)}
        style={styles.pressable}
        {...pressableProps}
      />
      <View pointerEvents={'none'}>
        <TextInput
          value={value}
          editable={false}
          disabled={disabled}
          right={
            <TextInput.Icon icon={active ? 'chevron-up' : 'chevron-down'} />
          }
          theme={{
            colors: {
              onSurfaceVariant:
                inputFocused || active
                  ? paperTheme.colors.primary
                  : paperTheme.colors.onSurfaceVariant,
            },
          }}
          underlineColor={
            inputFocused || active ? paperTheme.colors.primary : undefined
          }
          underlineColorAndroid={
            inputFocused || active ? paperTheme.colors.primary : undefined
          }
          underlineStyle={
            inputFocused || active ? styles.textInputFocusUnderline : undefined
          }
          style={[styles.textInput, inputStyle]}
        />
      </View>
    </View>
  );
};

export default TextInputAnchor;
