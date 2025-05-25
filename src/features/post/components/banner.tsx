import React from 'react';
import _ from 'lodash';
import { FlatList } from 'react-native';
import { useFetchBanners } from '@/features/post/api';
import { BannerItem } from '@/features/post/components/banner-item';

export const Banner: React.FC<any> = () => {
  const bannersQuery = useFetchBanners();
  const banners: any = _.flatMap(bannersQuery.data?.pages, (page: any) => page.data);

  const renderItem = ({ item }: any) => <BannerItem item={item} />;
  const onEndReached = () => {
    if (bannersQuery.hasNextPage && !bannersQuery.isFetchingNextPage) {
      bannersQuery.fetchNextPage();
    }
  };
  return (
    <FlatList
      data={banners}
      renderItem={renderItem}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      onEndReached={onEndReached}
    />
  );
};
