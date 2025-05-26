import React from 'react';
import _ from 'lodash';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { MainHeader } from '@/components/header';
import PageSpinner from '@/components/page-spinner';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';

const SenderItemSkeleton = () => {
  return (
    <HStack className="my-1 items-center justify-between" space="sm">
      <SkeletonText className="h-3 w-24" />
      <Card size="md" variant="elevated" className="flex-1 flex-grow rounded-md bg-primary-300 p-4">
        <SkeletonText className="h-3 w-full" _lines={2} />
      </Card>
    </HStack>
  );
};

const ReceiverItemSkeleton = () => {
  return (
    <HStack>
      <Skeleton variant="circular" className="h-6 w-6" />
      <HStack className="flex-1 items-center justify-between">
        <Card size="md" variant="elevated" className="m-3 w-2/3 rounded-md bg-primary-200 p-4">
          <SkeletonText className="h-3 w-full" _lines={2} />
        </Card>
        <View className="flex-1">
          <SkeletonText className="h-3 w-full" />
        </View>
      </HStack>
    </HStack>
  );
};

export const MessageListSkeleton: React.FC<any> = () => {
  const placeholders = _.map(new Array(4), (item, index) => ({
    documentId: _.uniqueId(),
    sender: index % 2 === 0,
  }));

  return (
    <>
      <PageSpinner />
      <VStack className="flex-1 justify-between">
        <VStack className="flex-1 p-4">
          {placeholders.map((item: any) =>
            item.sender ? <SenderItemSkeleton /> : <ReceiverItemSkeleton />,
          )}
        </VStack>
        <VStack className="px-4">
          <Skeleton variant="rounded" className="h-11 w-full rounded-3xl" />
        </VStack>
      </VStack>
    </>
  );
};
