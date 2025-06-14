import { MainHeader } from '@/components/header';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';

export const HeaderSkeleton: React.FC<any> = () => {
  return (
    <VStack space="xl" className="mb-4">
      <MainHeader />
    </VStack>
  );
};

export const ChatItemSkeleton: React.FC<any> = () => {
  return (
    <Card size="sm">
      <HStack space="sm" className="items-center rounded-lg">
        <Skeleton variant="circular" className="h-12 w-12" />
        <VStack space="xs" className="flex-1">
          <HStack className="items-center justify-between">
            <SkeletonText className="h-3 w-24" />
            <Skeleton variant="rounded" className="h-3 w-32" />
          </HStack>
          <HStack className="items-center justify-between">
            <SkeletonText _lines={1} className="h-3 w-full" />
          </HStack>
        </VStack>
      </HStack>
    </Card>
  );
};

export const ChatListSkeleton: React.FC<any> = () => {
  const placeholders = _.map(new Array(1), () => ({ documentId: _.uniqueId() }));

  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 px-4" space="md">
        <HeaderSkeleton />
        {placeholders.map((item: any) => (
          <View key={item.documentId}>
            <ChatItemSkeleton />
          </View>
        ))}
      </VStack>
    </SafeAreaView>
  );
};
