import { ImageryItem } from '@/components/imagery-item';
import { usePreferences } from '@/components/preferences-provider';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UserAvatar } from '@/features/user/components/user-avatar';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { View } from 'react-native';
import useExploreItemDimensions from '../hooks/use-explore-item-dimensions';
import { LikeButton } from './like-button';

export const ExploreItem: React.FC<any> = memo(function ExploreItem({ item, columnIndex }) {
  const { theme } = usePreferences();
  const router = useRouter();

  const { itemWidth, itemHeight } = useExploreItemDimensions({
    containerPadding: undefined,
    itemSpacing: undefined,
    attachment: item.cover,
  });

  return (
    <VStack
      space="sm"
      style={{
        margin: 7,
        marginLeft: columnIndex === 0 ? 0 : 7,
        marginRight: columnIndex === 1 ? 0 : 7,
      }}>
      <View className="flex-1 items-center justify-end">
        <ImageryItem
          uri={item.cover.thumbnail}
          cacheKey={item.cover.name}
          mime={item.cover.mime}
          alt={item.cover.alternativeText || item.cover.name}
          style={{
            width: itemWidth,
            height: itemHeight,
          }}
          className="rounded-md"
          onPress={() => router.push(`/posts/${item.documentId}`)}
        />
        <View className="absolute w-full items-center justify-between">
          <BlurView
            intensity={10}
            tint={theme === 'light' ? 'light' : 'dark'}
            style={{ borderRadius: 8 }}>
            <HStack className="w-full items-center justify-end px-2">
              <LikeButton post={item} />
            </HStack>
          </BlurView>
        </View>
      </View>
      <VStack space="sm">
        <Text size="lg" numberOfLines={2} className="font-bold">
          {item.title}
        </Text>
        <HStack className="items-center">
          <UserAvatar user={item.author} size="xs" />
        </HStack>
      </VStack>
    </VStack>
  );
});
