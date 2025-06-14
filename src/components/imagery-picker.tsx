import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Image } from 'lucide-react-native';
import React, { useState } from 'react';
import { ImagerySheet } from './imagery-sheet';

export const ImageryPicker = ({ onChange, value = [] }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const onPress = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const imagePickerOptions = {
    mediaTypes: ['images', 'videos', 'livePhotos'],
    allowsMultipleSelection: true,
    selectionLimit: 9,
  };

  return (
    <>
      <ButtonGroup space="sm">
        <Button variant="link" action="secondary" onPress={onPress}>
          <ButtonIcon as={Image} />
          <ButtonText>图片</ButtonText>
        </Button>
      </ButtonGroup>
      <ImagerySheet
        isOpen={isOpen}
        onClose={onClose}
        value={value}
        onChange={onChange}
        imagePickerOptions={imagePickerOptions}
      />
    </>
  );
};
