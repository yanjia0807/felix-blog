import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, Search } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { z } from 'zod';
import { fetchUsers } from '@/api';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat } from '@/utils/file';

type FilterFormSchema = z.infer<typeof filterFormSchema>;

const filterFormSchema = z.object({
  keyword: z.string().optional(),
});

const SearchUserList: React.FC = () => {
  const { user } = useAuth();
  const documentId = user.documentId;
  const [keyword, setKeyword] = useState();

  const { control, handleSubmit } = useForm<FilterFormSchema>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      keyword: undefined,
    },
  });

  const usersQuery = useInfiniteQuery({
    queryKey: ['users', 'detail', documentId, 'users', { keyword }],
    queryFn: fetchUsers,
    enabled: !!documentId,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      keyword,
      documentId,
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { page, pageSize, pageCount },
        },
      } = lastPage;

      if (page < pageCount) {
        return {
          pagination: { page: page + 1, pageSize },
          keyword,
          documentId,
        };
      }

      return null;
    },
  });

  const users: any = usersQuery.isSuccess
    ? _.reduce(usersQuery.data?.pages, (result: any, item: any) => [...result, ...item.data], [])
    : [];

  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonIcon as={ChevronLeft} />
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const onSubmit = (formData: any) => {
    setKeyword(formData.keyword);
  };

  const renderInput = ({ field: { onBlur, onChange, value } }: any) => {
    return (
      <FormControl className="flex-1">
        <Input variant="rounded">
          <InputSlot className="pl-3">
            <InputIcon as={Search} />
          </InputSlot>
          <InputField
            placeholder="用户名/邮箱地址"
            inputMode="text"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            returnKeyType="search"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        </Input>
      </FormControl>
    );
  };

  const renderListHeader = () => {
    return (
      <HStack className="w-full items-center justify-between">
        <Controller name="keyword" control={control} render={renderInput} />
      </HStack>
    );
  };

  const onItemPress = (item: any) => {
    router.push(`/users/${item.documentId}`);
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity
        className={`rounded-lg py-2 ${index === 0 ? 'mt-0' : ''} border-b-hairline border-outline-200`}
        onPress={() => {
          onItemPress(item);
        }}>
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
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '查询用户',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 p-4">
        <FlatList
          data={users}
          ListHeaderComponent={renderListHeader}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item: any) => item.documentId}
          onEndReached={() => {
            if (usersQuery.hasNextPage && !usersQuery.isFetchingNextPage)
              usersQuery.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={usersQuery.isLoading}
              onRefresh={() => {
                if (!usersQuery.isLoading) usersQuery.refetch();
              }}
            />
          }
        />
      </VStack>
    </SafeAreaView>
  );
};

const SearchUserListPage = () => {
  return <SearchUserList />;
};

export default SearchUserListPage;
