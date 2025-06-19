import { useAuth } from '@/features/auth/components/auth-provider';
import { BannerItem } from '@/features/post/components/banner-item';
import _ from 'lodash';
import React from 'react';
import { FlatList } from 'react-native';
import { useFetchBanners } from '../api/use-fetch-banners';

export const Banner: React.FC<any> = () => {
  const { user } = useAuth();
  const bannersQuery = useFetchBanners({
    blockUsers: _.map(user?.blockUsers, (item) => item.documentId),
  });
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
