import { Input, InputField } from '@/components/ui/input';
import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import React, { memo, useCallback, useEffect } from 'react';
import { NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';

export const CommentInput: React.FC<any> = memo(function CommentInput({
  onFocus,
  onBlur,
  onChange,
  value,
  isPending,
  placeholder,
  onSubmitEditing,
  inputRef,
}) {
  const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

  const handleOnFocus = useCallback(
    (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = true;
      if (onFocus) {
        onFocus(args);
      }
    },
    [onFocus, shouldHandleKeyboardEvents],
  );

  const handleOnBlur = useCallback(
    (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      shouldHandleKeyboardEvents.value = false;
      if (onBlur) {
        onBlur(args);
      }
    },
    [onBlur, shouldHandleKeyboardEvents],
  );

  useEffect(() => {
    return () => {
      shouldHandleKeyboardEvents.value = false;
    };
  }, [shouldHandleKeyboardEvents]);

  return (
    <Input variant="rounded" isDisabled={isPending}>
      <InputField
        ref={inputRef}
        inputMode="text"
        autoCapitalize="none"
        returnKeyType="send"
        placeholder={placeholder}
        value={value}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
        onChangeText={onChange}
        onSubmitEditing={onSubmitEditing}
      />
    </Input>
  );
});
