import React from 'react';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Input, InputSlot, InputIcon, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat } from '@/utils/file';

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
