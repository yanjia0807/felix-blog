import { ImageryItem } from '@/components/imagery-item';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat, videoThumbnailUrl } from '@/utils/file';
import { format } from 'date-fns';
import _ from 'lodash';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';

export const ReceiverImageryItem: React.FC<any> = memo(function ReceiverImageryItem({
  item,
  otherUser,
  onImageryPress,
}) {
  const { attachments, attachmentExtras } = item;

  const Imageries = _.map(attachments, (imagery) => {
    if (_.startsWith(imagery.mime, 'image')) {
      return {
        ...imagery,
        thumbnail: imageFormat(imagery, 's', 's').fullUrl,
      };
    } else {
      return {
        ...imagery,
        thumbnail: videoThumbnailUrl(imagery, attachmentExtras),
      };
    }
  });

  const onPress = (name) => {
    onImageryPress(name);
  };

  return (
    <TouchableOpacity>
      <HStack className="my-2 w-full items-center justify-between" space="xs">
        <HStack className="flex-1" space="xs">
          <Avatar size="xs">
            <AvatarFallbackText>{otherUser?.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: imageFormat(otherUser?.avatar, 's', 't')?.fullUrl,
              }}
            />
          </Avatar>
          <VStack space="md" className="flex-1">
            {_.map(Imageries, (imagery) => (
              <ImageryItem
                uri={imagery.thumbnail}
                cacheKey={imagery.name}
                mime={imagery.mime}
                alt={imagery.alternativeText || imagery.name}
                className="aspect-[1] w-full rounded-md"
                onPress={() => onPress(imagery.name)}
              />
            ))}
          </VStack>
        </HStack>
        <Text size="xs" className="w-1/4 text-right">
          {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
        </Text>
      </HStack>
    </TouchableOpacity>
  );
});
