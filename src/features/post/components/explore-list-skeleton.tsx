import React from 'react';
import { MasonryFlashList } from '@shopify/flash-list';
import _ from 'lodash';
import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import useExploreItemDimensions from '../hooks/use-explore-item-dimensions';

const ExploreItemSkeleton: React.FC<any> = ({ columnIndex }) => {
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
        <HStack className="w-24 items-center" space="xs">
          <Skeleton variant="circular" className="h-8 w-8" />
          <SkeletonText _lines={1} className="h-3" />
        </HStack>
      </HStack>
    </VStack>
  );
};

const ExploreListSkeleton: React.FC<any> = () => {
  const placeholders = _.map(new Array(4), () => ({ documentId: _.uniqueId() }));

  const renderListItem = ({ columnIndex }) => <ExploreItemSkeleton columnIndex={columnIndex} />;

  return (
    <MasonryFlashList
      renderItem={renderListItem}
      keyExtractor={(item: any) => item.documentId}
      data={placeholders}
      numColumns={2}
      estimatedItemSize={260}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default ExploreListSkeleton;
