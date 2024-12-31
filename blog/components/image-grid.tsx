import { Image } from 'expo-image';
import { BookImage, CircleX } from 'lucide-react-native';
import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Box } from './ui/box';
import { Button, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Popover, PopoverBackdrop, PopoverContent } from './ui/popover';
import { Pressable } from './ui/pressable';

export const ImageItem = ({
  image,
  index,
  handleSetCover,
  onOpenGallery,
  onLongPressImage,
  onRemoveImage,
  selectedImageId,
  setSelectedImageId,
}: any) => {
  return (
    <Popover
      isOpen={selectedImageId === image.assetId}
      onClose={() => setSelectedImageId(null)}
      shouldOverlapWithTrigger={true}
      trigger={(triggerProps: any) => (
        <Pressable
          {...triggerProps}
          onPress={() => onOpenGallery(index)}
          onLongPress={() => onLongPressImage(image.assetId)}
          key={image.assetId}>
          <Image
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 8,
            }}
            alt={image.alternativeText}
            source={{
              uri: image.uri,
            }}
          />
          {onRemoveImage && (
            <Pressable
              className="absolute right-0 top-0 m-1"
              onPress={() => onRemoveImage(image.assetId)}>
              <Icon as={CircleX} size="sm" className="text-gray-50" />
            </Pressable>
          )}

          {image.cover && (
            <Box className="absolute bottom-0 right-0 m-1">
              <Icon as={BookImage} size="sm" className="color-gray-50" />
            </Box>
          )}
        </Pressable>
      )}>
      <PopoverBackdrop />
      <PopoverContent size="xs" className="p-1">
        <Button size="xs" variant="link" onPress={() => handleSetCover(image.assetId)}>
          <ButtonText>设为封面</ButtonText>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export const ImageGrid = ({ images, onOpenGallery, onRemoveImage, className, onSetCover }: any) => {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  const numColumns = 4;
  const spacing = 10;
  const padding = 21;
  const imageSize = (screenWidth - padding * 2 - (numColumns - 1) * spacing) / numColumns;

  const handleSetCover = (imageId: string | null) => {
    setSelectedImageId(null);
    onSetCover(imageId);
  };

  const onLongPressImage = (assetId: string) => {
    if (onSetCover) {
      setSelectedImageId(assetId);
    }
  };

  return (
    <HStack className="flex-wrap">
      {images.map((image: any, index: number) => (
        <Box
          key={image.assetId}
          className="mb-2"
          style={{
            width: imageSize,
            height: imageSize,
            marginRight: (index + 1) % numColumns === 0 ? 0 : spacing,
            aspectRatio: 1,
            borderRadius: 8,
          }}>
          <ImageItem
            image={image}
            index={index}
            onOpenGallery={onOpenGallery}
            onRemoveImage={onRemoveImage}
            onLongPressImage={onLongPressImage}
            handleSetCover={handleSetCover}
            selectedImageId={selectedImageId}
            setSelectedImageId={setSelectedImageId}
          />
        </Box>
      ))}
    </HStack>
  );
};
