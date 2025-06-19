import { Divider } from '@/components/ui/divider';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import React, { memo, useCallback } from 'react';
import { FlatList } from 'react-native';
import { UserFilterInput } from './user-filter-input';
import { UserItem } from './user-item';

const UserList: React.FC<any> = memo(function UserList({ query, value, onChange }) {
  const router = useRouter();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = query;
  const users: any = _.flatMap(data?.pages, (page) => page.data);

  const onSubmitEditing = useCallback(() => {
    if (users.length > 0) {
      router.push(`/users/${users[0].documentId}`);
    }
  }, [users, router]);

  const renderItem = useCallback(({ item }: any) => <UserItem item={item} />, []);

  const renderItemSeparator = () => <Divider />;

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <FlatList
      data={users}
      ListHeaderComponent={
        <UserFilterInput
          value={value}
          onChange={onChange}
          onSubmitEditing={onSubmitEditing}
          isLoading={isLoading}
        />
      }
      renderItem={renderItem}
      ItemSeparatorComponent={renderItemSeparator}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item: any) => item.documentId}
      onEndReached={onEndReached}
    />
  );
});

export default UserList;
