import { ImageryItem } from '@/components/imagery-item';
import { ImagerySheet } from '@/components/imagery-sheet';
import { FormControl } from '@/components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ImageIcon } from 'lucide-react-native';
import React, { memo, useState } from 'react';

export const CoverPickerIcon = memo(function CoverPickerIcon({
  onChange,
  value,
  onPress,
  error,
}: any) {
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
        <ImageryItem
          assetId={value.assetId}
          source={{ uri: value.thumbnail }}
          cacheKey={value.name}
          mime={value.mime}
          alt={value.alternativeText || value.name}
          onPress={onPress}
          onRemove={onRemove}
          className="h-40 w-full rounded-md"
        />
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
          <ImagerySheet
            isOpen={isOpen}
            onClose={onClose}
            value={value}
            onChange={onValueChange}
            imagePickerOptions={imagePickerOptions}
          />
        </>
      )}
    </FormControl>
  );
});
