import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Image } from 'expo-image';
import { BookImage, CircleX } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Grid, GridItem } from '@/components/ui/grid';
import { Box } from './ui/box';
import { Button, ButtonText } from './ui/button';
import { Icon } from './ui/icon';
import { Popover, PopoverBackdrop, PopoverContent } from './ui/popover';
import { Text } from './ui/text';

const ImageItem = ({
  image,
  index,
  triggerProps,
  onOpenGallery,
  onLongPressImage,
  onRemoveImage,
}: any) => {
  return (
    <TouchableOpacity
      {...triggerProps}
      onPress={() => onOpenGallery(index)}
      onLongPress={() => onLongPressImage(image.assetId)}
      key={image.assetId}
      className="shadow-sm">
      <Image
        alt={image.fileName}
        style={{
          aspectRatio: 1,
          borderRadius: 12,
        }}
        source={{
          uri: image.uri,
        }}></Image>
      <TouchableOpacity
        className="absolute right-0 top-0 m-1"
        onPress={() => onRemoveImage(image.assetId)}>
        <Icon as={CircleX} size="sm" className="text-gray-50" />
      </TouchableOpacity>
      {image.cover && (
        <Box className="absolute bottom-0 right-0 m-1">
          <Icon as={BookImage} size="sm" className="color-gray-50" />
        </Box>
      )}
    </TouchableOpacity>
  );
};

const PostImageGrid = ({ images, onOpenGallery, onRemoveImage, className, onSetCover }: any) => {
  const PostImagesGridStyles = tva({});
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleSetCover = (imageId: string | null) => {
    setSelectedImageId(null);
    onSetCover(imageId);
  };

  const onLongPressImage = (assetId: string) => {
    setSelectedImageId(assetId);
  };

  return (
    <Grid
      className={`${PostImagesGridStyles({ className })} gap-0`}
      _extra={{
        className: 'grid-cols-4',
      }}>
      {images.map((image: any, index: number) => (
        <GridItem
          key={image.assetId}
          className="p-2"
          _extra={{
            className: 'col-span-1',
          }}>
          <Popover
            isOpen={selectedImageId === image.assetId}
            onClose={() => setSelectedImageId(null)}
            offset={-38}
            crossOffset={-38}
            shouldOverlapWithTrigger={true}
            trigger={(triggerProps: any) => (
              <ImageItem
                image={image}
                index={index}
                onOpenGallery={onOpenGallery}
                onRemoveImage={onRemoveImage}
                onLongPressImage={onLongPressImage}
                triggerProps={triggerProps}
              />
            )}>
            <PopoverBackdrop />
            <PopoverContent size="xs" className="p-1">
              <Button size="xs" variant="link" onPress={() => handleSetCover(image.assetId)}>
                <ButtonText>设为封面</ButtonText>
              </Button>
            </PopoverContent>
          </Popover>
        </GridItem>
      ))}
    </Grid>
  );
};

export default PostImageGrid;
