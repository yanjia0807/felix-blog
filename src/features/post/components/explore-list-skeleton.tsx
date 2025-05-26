import React from 'react';
import { MasonryFlashList } from '@shopify/flash-list';
import _ from 'lodash';
import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
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
      <SkeletonText _lines={2} className="h-4" />
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
    <HStack className="flex-1">
      <VStack className="flex-1">
        {_.map(
          _.map(new Array(4), () => ({ documentId: _.uniqueId() })),
          (item) => (
            <ItemSkeleton key={item.documentId} columnIndex={0} />
          ),
        )}
      </VStack>
      <VStack className="flex-1">
        {_.map(
          _.map(new Array(4), () => ({ documentId: _.uniqueId() })),
          (item) => (
            <ItemSkeleton key={item.documentId} columnIndex={1} />
          ),
        )}
      </VStack>
    </HStack>
  );
};

export default ExploreListSkeleton;
