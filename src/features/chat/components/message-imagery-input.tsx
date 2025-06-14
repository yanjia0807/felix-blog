import { ImagerySheet } from '@/components/imagery-sheet';
import { Icon } from '@/components/ui/icon';
import { Image } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';

export const MessageImageryInput: React.FC<any> = ({ onChange, value, onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onPress = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const imagePickerOptions = {
    mediaTypes: ['images', 'videos', 'livePhotos'],
    allowsMultipleSelection: true,
    selectionLimit: 9,
  };

  const doSubmit = (val) => {
    onChange(val);
    setTimeout(() => onSubmit(), 0);
  };

  return (
    <>
      <TouchableOpacity onPress={() => onPress()}>
        <Icon size="xl" as={Image} />
      </TouchableOpacity>
      <ImagerySheet
        isOpen={isOpen}
        imagePickerOptions={imagePickerOptions}
        value={value}
        onChange={doSubmit}
        onClose={onClose}
      />
    </>
  );
};
