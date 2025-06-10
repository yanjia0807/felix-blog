import { Skeleton } from '@/components/ui/skeleton';
import _ from 'lodash';
import React from 'react';
import { FlatList } from 'react-native';

const TagItemSkeleton: React.FC<any> = ({ index }) => {
  return <Skeleton variant="rounded" className={`mx-1 h-8 w-16 ${index === 0 && 'ml-0'}`} />;
};

const TagListSkeleton = () => {
  const placeholders = _.map(new Array(3), () => ({ documentId: _.uniqueId() }));

  const renderTagItem = ({ index }) => <TagItemSkeleton index={index} />;

  return (
    <FlatList
      data={placeholders}
      renderItem={renderTagItem}
      keyExtractor={(item: any) => item.documentId}
      contentContainerClassName="flex-grow"
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default TagListSkeleton;
