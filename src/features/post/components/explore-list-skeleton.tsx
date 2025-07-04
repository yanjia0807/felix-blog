import { HeaderLogo } from '@/components/header';
import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import _ from 'lodash';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import useExploreItemDimensions from '../hooks/use-explore-item-dimensions';

const ItemSkeleton: React.FC<any> = ({ columnIndex }) => {
  const { itemWidth, itemHeight } = useExploreItemDimensions({
    containerPadding: undefined,
    itemSpacing: undefined,
    attachment: undefined,
  });

  return (
    <VStack
      style={{
        width: itemWidth,
        height: itemHeight,
        margin: 7,
        marginLeft: columnIndex === 0 ? 0 : 7,
        marginRight: columnIndex === 1 ? 0 : 7,
      }}
      space="sm">
      <Skeleton variant="rounded" className="flex-1" />
      <SkeletonText _lines={2} className="h-3" />
      <HStack className="items-center justify-between">
        <HStack className="items-center" space="xs">
          <Skeleton variant="circular" className="h-8 w-8" />
          <SkeletonText _lines={1} className="h-3 w-12" />
        </HStack>
      </HStack>
    </VStack>
  );
};

const ExploreListSkeleton: React.FC<any> = () => {
  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 px-4" space="md">
        <HStack className="w-full items-center justify-between overflow-auto">
          <HeaderLogo />
        </HStack>
        <HStack space="sm" className="w-full">
          <Skeleton variant="rounded" className="h-8 flex-1" />
          <Skeleton variant="rounded" className="h-8 flex-1" />
          <Skeleton variant="rounded" className="h-8 flex-1" />
        </HStack>
        <HStack className="flex-1">
          <ItemSkeleton key={_.uniqueId()} columnIndex={0} />
          <ItemSkeleton key={_.uniqueId()} columnIndex={1} />
        </HStack>
      </VStack>
    </SafeAreaView>
  );
};

export default ExploreListSkeleton;
