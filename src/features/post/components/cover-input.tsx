import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ImageItem } from '@/features/image/components/image-item';
import { ImageSheet } from '@/features/image/components/image-sheet';
import { AlertCircle, ImageIcon } from 'lucide-react-native';
import React, { memo, useState } from 'react';

export const CoverInput = memo(function CoverInput({ onChange, value, onPress, error }: any) {
  const [isOpen, setIsOpen] = useState(false);

  const imagePickerOptions = {
    mediaTypes: ['images', 'videos', 'livePhotos'],
    allowsMultipleSelection: false,
  };

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onRemove = () => onChange(undefined);
  const onValueChange = (val: any) =>
    val && val.length > 0 ? onChange(val[0]) : onChange(undefined);

  return (
    <FormControl isInvalid={!!error} size="md">
      {value ? (
        <ImageItem item={value} onPress={onPress} onRemove={onRemove} className="h-40" />
      ) : (
        <>
          <Pressable onPress={onOpen} pointerEvents="box-only">
            <Input variant="underlined" className="border-0 border-b p-2" isReadOnly={true}>
              <InputField placeholder="请选择封面...." />
              <InputSlot>
                <InputIcon as={ImageIcon}></InputIcon>
              </InputSlot>
            </Input>
          </Pressable>
          <ImageSheet
            isOpen={isOpen}
            onClose={onClose}
            value={value}
            onChange={onValueChange}
            imagePickerOptions={imagePickerOptions}
          />
        </>
      )}
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{error?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
});
