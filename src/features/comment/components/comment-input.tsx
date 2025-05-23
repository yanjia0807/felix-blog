import React, { forwardRef, memo, useCallback, useEffect } from 'react';
import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { Input, InputField } from '@/components/ui/input';

export const CommentInput: React.FC<any> = memo(
  forwardRef<any, any>(
    ({ onFocus, onBlur, onChange, value, isPending, placeholder, onSubmitEditing }, ref) => {
      console.log('@render CommentInput');

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
            ref={ref}
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
    },
  ),
);
