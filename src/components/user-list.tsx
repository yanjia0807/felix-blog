import React from 'react';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { imageFormat } from '@/utils/file';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { Card } from './ui/card';
import { Divider } from './ui/divider';
import { HStack } from './ui/hstack';
import { Input, InputSlot, InputIcon, InputField } from './ui/input';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

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
  const renderListHeader = () => {
    return (
      <Input size="md" className="flex-1">
        <InputSlot className="ml-3">
          <InputIcon as={Search} />
        </InputSlot>
        <InputField
          placeholder="用户名/邮箱地址"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onChangeText={onChange}
          onSubmitEditing={onSubmitEditing}
          value={value}
        />
        {isLoading && (
          <InputSlot className="mx-3">
            <InputIcon as={Spinner} />
          </InputSlot>
        )}
      </Input>
    );
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity
        onPress={() => {
          onItemPress(item);
        }}>
        <Card size="sm" variant="ghost">
          <HStack className={`items-center`} space="md">
            <Avatar size="sm">
              <AvatarFallbackText>{item.username}</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: imageFormat(item.avatar, 's', 't')?.fullUrl,
                }}
              />
            </Avatar>
            <VStack>
              <Text bold={true}>{item.username}</Text>
              <Text size="sm">{item.email}</Text>
            </VStack>
          </HStack>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderItemSeparator = () => <Divider orientation="horizontal" />;

  const onItemPress = (item: any) => {
    router.push(`/users/${item.documentId}`);
  };

  const onSubmitEditing = () => {
    if (data.length > 0) {
      router.push(`/users/${data[0].documentId}`);
    }
  };

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
