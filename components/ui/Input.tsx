import { Feather } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  /** Renders a show/hide toggle instead of a static secureTextEntry field. */
  isPassword?: boolean;
}

// Every field carries its own default/focus/error state — DESIGN_SPEC.md
// calls for real-time inline validation, not just on-submit.
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, isPassword, secureTextEntry, onFocus, onBlur, multiline, ...textInputProps },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  const borderClass = error
    ? 'border-error'
    : isFocused
      ? 'border-cyan-vivid'
      : 'border-border-light dark:border-border';

  return (
    <View>
      <Text className="mb-2 font-body-medium text-small text-secondary-light dark:text-secondary">{label}</Text>
      <View
        className={`flex-row items-center rounded-xl border bg-surface-light px-4 dark:bg-surface ${
          multiline ? 'py-3' : ''
        } ${borderClass}`}
      >
        <TextInput
          ref={ref}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          className={`flex-1 font-body text-body text-primary-light dark:text-primary ${
            multiline ? 'min-h-24' : 'h-14'
          }`}
          placeholderTextColor="#A0A0A8"
          secureTextEntry={isPassword ? isHidden : secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={label}
          {...textInputProps}
        />
        {isPassword && (
          <Pressable
            onPress={() => setIsHidden((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isHidden ? 'Show password' : 'Hide password'}
          >
            <Feather name={isHidden ? 'eye' : 'eye-off'} size={20} color="#A0A0A8" />
          </Pressable>
        )}
      </View>
      {error && <Text className="mt-1 font-body text-small text-error">{error}</Text>}
    </View>
  );
});
