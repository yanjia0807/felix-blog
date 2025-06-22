import { ImageryItem } from '@/components/imagery-item';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat, videoThumbnailUrl } from '@/utils/file';
import { format } from 'date-fns';
import _ from 'lodash';
import React, { memo } from 'react';

export const SenderImageryItem: React.FC<any> = memo(function SenderImageryItem({
  item,
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
    <HStack className="my-2 w-full items-center" space="xs">
      <Text size="xs" className="w-1/4">
        {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
      </Text>
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
  );
});
