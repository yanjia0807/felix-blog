import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { ImageSheet } from './image-sheet';

const SELECTION_LIMIT = 9;

export const ImageInput = ({ onChange, value = [] }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const onPress = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const imagePickerOptions = {
    mediaTypes: ['images', 'videos', 'livePhotos'],
    allowsMultipleSelection: true,
    selectionLimit: SELECTION_LIMIT,
  };

  return (
    <>
      <ButtonGroup space="sm">
        <Button variant="link" action="secondary" onPress={onPress}>
          <ButtonIcon as={ImageIcon} />
          <ButtonText>图片</ButtonText>
        </Button>
      </ButtonGroup>
      <ImageSheet
        isOpen={isOpen}
        onClose={onClose}
        value={value}
        onChange={onChange}
        imagePickerOptions={imagePickerOptions}
      />
    </>
  );
};
