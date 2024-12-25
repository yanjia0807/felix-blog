import { useInfiniteQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, Search } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { apiServerURL, fetchUsers } from '@/api';
import { useAuth } from '@/components/auth-context';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const AddFriend = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<any>(null);

  const {
    control,
    formState: { isSubmitted, errors },
    handleSubmit,
    reset,
    getValues,
  } = useForm({});

  const {
    data: usersData,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['users', filters],
    queryFn: fetchUsers,
    enabled: !!filters,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      filters,
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
          filters,
        };
      }

      return null;
    },
  });

  const users: any = _.reduce(
    usersData?.pages,
    (result: any, item: any) => [...result, ...item.data],
    [],
  );

  const renderHeaderLeft = () => {
    return (
      <Button
        size="md"
        action="secondary"
        variant="link"
        onPress={() => {
          router.back();
        }}>
        <ButtonIcon as={ChevronLeft} />
      </Button>
    );
  };

  const onSubmit = (data: any) => {
    const newFilters = {
      $and: [
        {
          id: {
            $ne: user.id,
          },
        },
        {
          blocked: false,
        },
        {
          confirmed: true,
        },
        data.filter
          ? {
              $or: [
                {
                  username: {
                    $containsi: data.filter,
                  },
                },
                {
                  email: {
                    $containsi: data.filter,
                  },
                },
              ],
            }
          : {},
      ],
    };

    setFilters(newFilters);
  };

  const renderInput = ({ field: { onBlur, onChange, value } }: any) => {
    return (
      <FormControl size="lg" className="flex-1">
        <Input className="my-2 w-full border p-3">
          <InputSlot>
            <InputIcon as={Search} />
          </InputSlot>
          <InputField
            placeholder="用户名/邮箱地址"
            inputMode="text"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        </Input>
      </FormControl>
    );
  };

  const renderListHeader = () => {
    return (
      <HStack className="w-full items-center justify-between" space="md">
        <Controller name="filter" control={control} render={renderInput} />
        <HStack>
          <Button onPress={handleSubmit(onSubmit)}>
            <ButtonText>查找</ButtonText>
          </Button>
        </HStack>
      </HStack>
    );
  };

  const onAddBtnPressed = ({ item }: any) => {
    router.push({
      pathname: '/users/[documentId]',
      params: {
        documentId: item.documentId,
      },
    });
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity
        className={`rounded-lg py-2 ${index === 0 ? 'mt-0' : ''} border-b-hairline border-outline-200`}
        onPress={() => {
          onAddBtnPressed({ item });
        }}>
        <HStack className={`items-center`} space="md">
          <Avatar size="sm">
            <AvatarFallbackText>{item.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: `${apiServerURL}/${item.avatar?.formats.thumbnail.url}`,
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
          title: '添加朋友',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 px-6">
        <FlatList
          data={users}
          ListHeaderComponent={renderListHeader}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item: any) => item.documentId}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
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
          contentContainerClassName="flex-1"
        />
      </VStack>
    </SafeAreaView>
  );
};

export default AddFriend;
