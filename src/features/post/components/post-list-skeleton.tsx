import React from 'react';
import _ from 'lodash';
import { FlatList, View } from 'react-native';
import { MainHeader } from '@/components/header';
import PageSpinner from '@/components/page-spinner';
import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';

export const BannerSkeleton: React.FC<any> = ({ index }) => (
  <Skeleton className={`mr-4 h-48 w-80`} variant="rounded" />
);

export const PostSkeleton: React.FC<any> = () => (
  <VStack className="mt-6 w-full rounded-lg bg-background-100 p-2" space="lg">
    <HStack className="items-center justify-between">
      <HStack className="w-24 items-center" space="xs">
        <Skeleton variant="circular" className="h-8 w-8" />
        <SkeletonText _lines={1} className="h-4" />
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

export const HeaderSkeleton: React.FC<any> = () => {
  const placeholders = _.map(new Array(2), () => ({ documentId: _.uniqueId() }));

  const renderItem = () => <BannerSkeleton />;

  return (
    <VStack space="lg">
      <MainHeader />
      <Skeleton variant="rounded" className="h-8 w-full self-center" />
      <FlatList
        data={placeholders}
        renderItem={renderItem}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
    </VStack>
  );
};

export const PostListSkeleton: React.FC<any> = () => {
  const placeholders = _.map(new Array(2), () => ({ documentId: _.uniqueId() }));

  const renderListHeader = () => <HeaderSkeleton />;

  const renderListItem = () => <PostSkeleton />;

  return (
    <>
      <FlatList
        data={placeholders}
        contentContainerClassName="flex-grow"
        keyExtractor={(item) => item.documentId}
        ListHeaderComponent={renderListHeader}
        renderItem={renderListItem}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
};
