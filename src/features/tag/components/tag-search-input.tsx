import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { Search } from 'lucide-react-native';
import React, { forwardRef, memo, useCallback, useEffect } from 'react';
import { NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';

export const TagSearchInput: React.FC<any> = memo(
  forwardRef<any, any>(({ onFocus, onBlur, onChange, value, isLoading }, ref) => {
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
      <Input variant="rounded" className="w-full">
        <InputSlot className="ml-3">
          <InputIcon as={Search} />
        </InputSlot>
        <InputField
          ref={ref}
          inputMode="text"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          placeholder="搜索标签..."
          value={value}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          onChangeText={onChange}
        />
        {isLoading && (
          <InputSlot className="mx-3">
            <InputIcon as={Spinner} />
          </InputSlot>
        )}
      </Input>
    );
  }),
);
