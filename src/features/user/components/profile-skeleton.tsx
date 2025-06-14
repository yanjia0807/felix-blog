import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import _ from 'lodash';
import React from 'react';
import { PostItemSkeleton } from './post-item-skeleton';

export const ProfileSkeleton: React.FC<any> = () => {
  const placeholders = _.map(new Array(1), () => ({ documentId: _.uniqueId() }));

  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 p-4" space="md">
        <VStack space="md" className="flex-1">
          <HStack className="items-center justify-between">
            <HStack className="items-center" space="md">
              <Skeleton variant="circular" className="h-16 w-16" />
              <SkeletonText className="h-3 w-24" />
            </HStack>
          </HStack>
          <HStack className="items-center" space="sm">
            <Skeleton variant="rounded" className="h-3 w-16" />
            <Skeleton variant="rounded" className="h-3 w-16" />
          </HStack>
          <SkeletonText _lines={1} className="h-3" />
          <Skeleton variant="rounded" className="h-16 w-full" />
          <HStack space="sm">
            <Skeleton variant="rounded" className="h-8 flex-1" />
            <Skeleton variant="rounded" className="h-8 flex-1" />
          </HStack>
          <VStack>
            {placeholders.map((item: any, index: number) => (
              <PostItemSkeleton key={item.documentId} index={index} />
            ))}
          </VStack>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};
