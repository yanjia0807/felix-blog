import { HeaderLogo } from '@/components/header';
import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import _ from 'lodash';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export const BannerSkeleton: React.FC<any> = ({ index }) => (
  <Skeleton className={`mr-4 h-40 w-80`} variant="rounded" />
);

export const PostItemSkeleton: React.FC<any> = () => (
  <VStack className="w-full rounded-lg bg-background-100 p-2" space="lg">
    <HStack className="items-center justify-between">
      <HStack className="items-center" space="xs">
        <Skeleton variant="circular" className="h-8 w-8" />
        <SkeletonText className="h-4 w-24" />
      </HStack>
      <Skeleton variant="sharp" className="h-4 w-24" />
    </HStack>
    <SkeletonText _lines={2} className="h-3" />
    <Skeleton variant="rounded" className="h-52" />
    <SkeletonText _lines={3} className="h-3" />
    <HStack className="items-center" space="sm">
      <Skeleton variant="rounded" className="h-14 w-14" />
      <Skeleton variant="rounded" className="h-14 w-14" />
    </HStack>
  </VStack>
);

export const BarSkeleton: React.FC<any> = () => {
  const placeholders = _.map(new Array(2), () => ({ documentId: _.uniqueId() }));

  return (
    <HStack className="overflow-hidden">
      {placeholders.map((item: any) => (
        <BannerSkeleton key={item.documentId} />
      ))}
    </HStack>
  );
};

export const PostListSkeleton: React.FC<any> = () => {
  const placeholders = _.map(new Array(2), () => ({ documentId: _.uniqueId() }));
  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 px-4" space="md">
        <HStack className="w-full items-center justify-between overflow-auto">
          <HeaderLogo />
        </HStack>
        <Skeleton variant="rounded" className="h-12 self-center" />
        <BarSkeleton />
        <Skeleton variant="rounded" className="h-20" />
        <VStack className="flex-1">
          {placeholders.map((item: any) => (
            <PostItemSkeleton key={item.documentId} />
          ))}
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};
