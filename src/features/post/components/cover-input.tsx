import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react-native';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ImageItem } from '@/features/image/components/image-item';
import { ImageSheet } from '@/features/image/components/image-sheet';

export const CoverInput = ({ onChange, value, onPress }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const imagePickerOptions = {
    mediaTypes: ['images', 'videos', 'livePhotos'],
    allowsMultipleSelection: false,
  };

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onRemove = () => onChange(undefined);

  const handleChange = (val: any) => {
    if (val && val.length > 0) {
      onChange(val[0]);
    } else {
      onChange(undefined);
    }
  };

  return (
    <>
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
            onChange={handleChange}
            imagePickerOptions={imagePickerOptions}
          />
        </>
      )}
    </>
  );
};
