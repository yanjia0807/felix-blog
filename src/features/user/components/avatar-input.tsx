import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { ImageSheet } from '@/features/image/components/image-sheet';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';

export const AvatarInput = ({ onChange, value, fallbackText }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onRemove = () => {
    onChange(null);
  };

  const source = value ? { uri: value.uri } : undefined;

  const imagePickerOptions = {
    allowsMultipleSelection: false,
    mediaTypes: ['images'],
  };

  const handleChange = (val: any) => {
    if (val && val.length > 0) {
      onChange(val[0]);
    } else {
      onChange(undefined);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => onOpen()}>
        <Avatar size="xl">
          {source ? (
            <AvatarImage source={source} />
          ) : (
            <AvatarFallbackText>{fallbackText}</AvatarFallbackText>
          )}
          <AvatarBadge className="items-center justify-center">
            <TouchableOpacity onPress={onRemove}>
              <Icon as={X} size="lg" />
            </TouchableOpacity>
          </AvatarBadge>
        </Avatar>
      </TouchableOpacity>
      <ImageSheet
        isOpen={isOpen}
        onClose={onClose}
        onChange={handleChange}
        imagePickerOptions={imagePickerOptions}
      />
    </>
  );
};
