import { ImageryItem } from '@/components/imagery-item';
import { ImagerySheet } from '@/components/imagery-sheet';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { AlertCircle, ImageIcon } from 'lucide-react-native';
import React, { memo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export const CoverPicker = memo(function CoverPickerIcon({ onChange, value, onPress, error }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const coverHeight = windowHeight / 4; // Limit cover height to 200px or 1/3 of the window height

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
        <ImageryItem
          uri={value.thumbnail}
          cacheKey={value.name}
          mime={value.mime}
          alt={value.alternativeText || value.name}
          onPress={onPress}
          onRemove={onRemove}
          style={{ height: coverHeight }}
          className="w-full rounded-md"
        />
      ) : (
        <FormControl size="md" isInvalid={!!error}>
          <Pressable onPress={onOpen} pointerEvents="box-only">
            <Input variant="underlined" className="border-0 border-b p-2" isReadOnly={true}>
              <InputField placeholder="请选择封面...." />
              <InputSlot>
                <InputIcon as={ImageIcon}></InputIcon>
              </InputSlot>
            </Input>
          </Pressable>
          <ImagerySheet
            isOpen={isOpen}
            onClose={onClose}
            value={value}
            onChange={onValueChange}
            imagePickerOptions={imagePickerOptions}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertCircle} />
            <FormControlErrorText>{error?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>
      )}
    </FormControl>
  );
});
