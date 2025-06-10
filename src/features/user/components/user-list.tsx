import { Divider } from '@/components/ui/divider';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { UserFilterInput } from './user-filter-input';
import { UserItem } from './user-item';

const UserList: React.FC<any> = ({
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  refetch,
  value,
  onChange,
}) => {
  const router = useRouter();

  const onSubmitEditing = () => {
    if (data.length > 0) {
      router.push(`/users/${data[0].documentId}`);
    }
  };

  const renderListHeader = () => (
    <UserFilterInput
      value={value}
      onChange={onChange}
      onSubmitEditing={onSubmitEditing}
      isLoading={isLoading}
    />
  );

  const renderItem = ({ item, index }: any) => <UserItem item={item} />;

  const renderItemSeparator = () => <Divider />;

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <FlatList
      data={data}
      ListHeaderComponent={renderListHeader}
      renderItem={renderItem}
      ItemSeparatorComponent={renderItemSeparator}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item: any) => item.documentId}
      onEndReached={onEndReached}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => {
            if (!isLoading) {
              refetch();
            }
          }}
        />
      }
    />
  );
};

export default UserList;
