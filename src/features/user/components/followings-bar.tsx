import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useFetchFollowings } from '@/features/user/api/use-fetch-followings';
import _ from 'lodash';
import React from 'react';
import { FlatList, View } from 'react-native';
import { FollowingsBarItem } from './followings-bar-item';

export const FollowingsBar: React.FC<any> = () => {
  const { user } = useAuth();

  const filters = { userDocumentId: user?.documentId };

  const followingsQuery = useFetchFollowings({ filters });

  const followings = _.flatMap(followingsQuery.data?.pages, (page) => page.data);

  const renderItem = ({ item }: any) => <FollowingsBarItem item={item} />;

  const renderEmptyComponent = () => (
    <View className="flex-1 items-center justify-center">
      <Text size="sm">暂无数据</Text>
    </View>
  );

  return (
    <FlatList
      data={followings}
      ListEmptyComponent={renderEmptyComponent}
      renderItem={renderItem}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    />
  );
};
