import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router, useRouter } from 'expo-router';
import _ from 'lodash';
import { AlertCircle, ChevronLeft, Filter, Search } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { FlatList, Keyboard, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { fetchPostsOutline } from '@/api';
import { DateInput } from '@/components/date-input';
import PageSpinner from '@/components/page-spinner';
import { TagSelect } from '@/components/tag-input';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputSlot, InputIcon, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UserAvatar } from '@/components/user';
import useDebounce from '@/hooks/use-debounce';
import { PageFallbackUI } from '@/components/fallback';

const PostFilterContext = createContext<any>(undefined);

export const usePostFilterContext = () => {
  const context = useContext(PostFilterContext);
  if (!context) {
    throw new Error('usePostFilterContext must be used within a PostFilterProvider');
  }
  return context;
};

const postFilterSchema = z.object({
  title: z.string().optional(),
  authorName: z.string().optional(),
  publishDateFrom: z.date().optional(),
  publishDateTo: z.date().optional(),
  tags: z.array(z.any()),
});

type PostFilterSchema = z.infer<typeof postFilterSchema>;

export const PostFilterProvider = ({ children }: any) => {
  const [filters, setFilters] = useState<any>({
    title: undefined,
    authorName: undefined,
    publishDateFrom: undefined,
    publishDateTo: undefined,
    tags: [],
  });
  const [searchFrom, setSearchFrom] = useState<'keywords' | 'filters'>('keywords');
  const [keywords, setKeywords] = useState(undefined);
  const debounceKeywords = useDebounce(keywords, 500);

  const hasFilters = useMemo(() => {
    return (
      (!_.isNil(filters.title) && _.trim(filters.title) !== '') ||
      (!_.isNil(filters.authorName) && _.trim(filters.authorName) !== '') ||
      !_.isNil(filters.publishDateFrom) ||
      !_.isNil(filters.publishDateTo) ||
      filters.tags.length > 0
    );
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters({
      title: undefined,
      authorName: undefined,
      publishDateFrom: undefined,
      publishDateTo: undefined,
      tags: [],
    });
  }, []);

  const hasKeywords = useMemo(() => {
    return !_.isNil(debounceKeywords) && _.trim(debounceKeywords) !== '';
  }, [debounceKeywords]);

  const value = useMemo(
    () => ({
      keywords,
      debounceKeywords,
      setKeywords,
      hasKeywords,
      filters,
      setFilters,
      resetFilters,
      hasFilters,
      searchFrom,
      setSearchFrom,
    }),
    [debounceKeywords, filters, hasFilters, hasKeywords, keywords, resetFilters, searchFrom],
  );

  return <PostFilterContext.Provider value={value}>{children}</PostFilterContext.Provider>;
};

const DrawerContext = createContext<any>(undefined);

export const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawerContext must be used within a DrawerProvider');
  }
  return context;
};

export const DrawerProvider = ({ children }: any) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const onOpen = useCallback(() => setIsDrawerOpen(true), []);
  const onClose = useCallback(() => setIsDrawerOpen(false), []);

  const value = useMemo(
    () => ({
      isDrawerOpen,
      onOpen,
      onClose,
    }),
    [isDrawerOpen, onOpen, onClose],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
};

const FilterIcon: React.FC<any> = () => {
  const { onOpen } = useDrawerContext();
  const handleOpen = () => {
    Keyboard.dismiss();
    onOpen();
  };
  return (
    <Button variant="link" action="secondary" onPress={handleOpen} pointerEvents="box-only">
      <ButtonIcon as={Filter} className="text-secondary-900" />
    </Button>
  );
};

const PostSearchHeader: React.FC<any> = ({ value, onChange, onSubmitEditing, isLoading }) => {
  useEffect(() => console.log('@render PostSearchHeader'));

  return (
    <VStack space="md">
      <HStack space="lg" className="w-full items-center justify-between">
        <Button action="secondary" variant="link" onPress={() => router.back()}>
          <ButtonIcon as={ChevronLeft} />
          <ButtonText>返回</ButtonText>
        </Button>
        <Input size="lg" variant="rounded" className="flex-1">
          <InputSlot className="ml-3">
            <InputIcon as={Search} />
          </InputSlot>
          <InputField
            autoFocus={true}
            value={value}
            inputMode="text"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(text) => onChange(text)}
            onSubmitEditing={onSubmitEditing}
            returnKeyType="search"
            placeholder="搜索帖子..."
          />
          {isLoading && (
            <InputSlot className="mx-3">
              <InputIcon as={Spinner} />
            </InputSlot>
          )}
          <InputSlot className="mx-3">
            <InputIcon as={FilterIcon} />
          </InputSlot>
        </Input>
      </HStack>
      <Divider />
    </VStack>
  );
};

const PostSearchDrawer: React.FC<any> = () => {
  useEffect(() => console.log('@render PostDrawer'));

  const { isDrawerOpen, onOpen, onClose } = useDrawerContext();

  return (
    <Drawer
      open={isDrawerOpen}
      onOpen={onOpen}
      onClose={onClose}
      drawerType="slide"
      swipeEnabled={false}
      renderDrawerContent={() => <PostFilterContent />}>
      <PostSearch />
    </Drawer>
  );
};

const PostFilterContent: React.FC<any> = memo(() => {
  useEffect(() => console.log('@render PostFilterContent'));

  const { onClose } = useDrawerContext();
  const { filters, setFilters, setKeywords, setSearchFrom, resetFilters } = usePostFilterContext();
  const insets = useSafeAreaInsets();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<PostFilterSchema>({
    resolver: zodResolver(postFilterSchema),
    defaultValues: filters,
  });

  const renderTitle = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.title}>
        <Input variant="underlined">
          <InputField
            type="text"
            value={value}
            inputMode="text"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="标题...."
          />
        </Input>
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.title?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  const renderAuthorName = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.authorName}>
        <Input variant="underlined">
          <InputField
            type="text"
            value={value}
            inputMode="text"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="作者...."
          />
        </Input>
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.authorName?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  const renderCreatedAtFrom = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.publishDateFrom} className="flex-1">
        <DateInput
          value={value}
          onChange={onChange}
          defaultDate={new Date()}
          placeholder="发布日期"
          variant="underlined"
          className="flex-1"
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.publishDateFrom?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  const renderCreatedAtTo = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.publishDateTo} className="flex-1">
        <DateInput
          value={value}
          onChange={onChange}
          placeholder="发布日期"
          defaultDate={new Date()}
          variant="underlined"
          className="flex-1"
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.publishDateTo?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  const renderTags = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.tags}>
        <TagSelect value={value} onChange={onChange} />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.tags?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  const onSubmit = (data: any) => {
    setSearchFrom('filters');
    setFilters(data);
    setKeywords(undefined);
    onClose();
  };

  const onReset = () => {
    resetFilters();
  };

  useEffect(() => {
    reset(filters);
  }, [filters, reset]);

  return (
    <VStack className="flex-1 bg-background-50 px-4" style={{ paddingTop: insets.top }}>
      <KeyboardAwareScrollView className="flex-1">
        <VStack className="flex-1" space="lg">
          <Controller name="title" control={control} render={renderTitle} />
          <Controller name="authorName" control={control} render={renderAuthorName} />
          <HStack className="items-center" space="lg">
            <Controller name="publishDateFrom" control={control} render={renderCreatedAtFrom} />
            <Text>--</Text>
            <Controller name="publishDateTo" control={control} render={renderCreatedAtTo} />
          </HStack>
          <Controller name="tags" control={control} render={renderTags} />
          <VStack className="mt-8" space="md">
            <Button action="positive" onPress={handleSubmit(onSubmit)}>
              <ButtonText>搜索</ButtonText>
            </Button>
            <Button action="negative" onPress={() => onReset()}>
              <ButtonText>重置</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </KeyboardAwareScrollView>
    </VStack>
  );
});

const PostOutlineItem: React.FC<any> = ({ item }) => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(`/posts/${item.documentId}`)}>
      <Card size="sm" variant="ghost">
        <HStack className="items-center justify-between">
          <Text>{item.title}</Text>
          <UserAvatar user={item.author}></UserAvatar>
        </HStack>
      </Card>
    </TouchableOpacity>
  );
};

const PostSearch = memo(() => {
  useEffect(() => console.log('@render PostSearch'));

  const {
    filters,
    hasFilters,
    resetFilters,
    searchFrom,
    setSearchFrom,
    debounceKeywords,
    keywords,
    setKeywords,
    hasKeywords,
  } = usePostFilterContext();

  let queryFilters = {};
  if (searchFrom === 'keywords') {
    queryFilters = {
      title: debounceKeywords,
    };
  } else {
    queryFilters = {
      ...filters,
      tag: _.map(filters.tag || [], (item) => item.id),
    };
  }

  const outlineQuery = useInfiniteQuery({
    queryKey: ['posts', 'list', 'outline', queryFilters],
    queryFn: fetchPostsOutline,
    enabled: (searchFrom === 'filters' && hasFilters) || (searchFrom === 'keywords' && hasKeywords),
    placeholderData: (prev) => prev,
    initialPageParam: {
      filters: queryFilters,
      pagination: {
        page: 1,
        pageSize: 20,
      },
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { page, pageSize, pageCount },
        },
      } = lastPage;

      if (page < pageCount) {
        return {
          filters: queryFilters,
          pagination: { page: page + 1, pageSize },
        };
      }

      return null;
    },
  });

  const outlines: any = outlineQuery.isSuccess
    ? _.reduce(outlineQuery.data?.pages, (result: any, page: any) => [...result, ...page.data], [])
    : [];

  const renderItem = ({ item }: any) => <PostOutlineItem item={item} />;

  const renderEmptyComponent = (
    <View className="mt-32 flex-1 items-center">
      <Text>暂无数据</Text>
    </View>
  );

  const renderItemSeparator = () => <Divider orientation="horizontal" />;

  const onEndReached = () => {
    if (outlineQuery.hasNextPage && !outlineQuery.isFetchingNextPage) {
      outlineQuery.fetchNextPage();
    }
  };

  const onSearchTextChange = (text: string) => {
    setSearchFrom('keywords');
    resetFilters();
    setKeywords(text);
  };

  const onSubmitEditing = () => {
    if (outlines.length > 0) {
      router.push(`/posts/${outlines[0].documentId}`);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <PageSpinner isVisiable={outlineQuery.isLoading} />
      <VStack className="flex-1 px-4" space="md">
        <PostSearchHeader
          value={keywords}
          onChange={onSearchTextChange}
          onSubmitEditing={onSubmitEditing}
          isLoading={outlineQuery.isLoading}
        />
        <FlatList
          renderScrollComponent={(props) => (
            <KeyboardAwareScrollView {...props} showsVerticalScrollIndicator={false} />
          )}
          contentContainerClassName="flex-grow"
          data={outlines}
          keyExtractor={(item) => item.documentId}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyComponent}
          ItemSeparatorComponent={renderItemSeparator}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
        />
      </VStack>
    </SafeAreaView>
  );
});

const PostSearchPage: React.FC<any> = () => {
  useEffect(() => console.log('@render PostSearchPage'));

  return (
    <DrawerProvider>
      <PostFilterProvider>
        <PostSearchDrawer>
          <PostSearch />
        </PostSearchDrawer>
      </PostFilterProvider>
    </DrawerProvider>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default PostSearchPage;
