import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { View, Text, FlatList, TouchableHighlight } from 'react-native';
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Card } from './ui/card';
import { Divider } from './ui/divider';
import { HStack } from './ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { Portal } from './ui/portal';
import { Spinner } from './ui/spinner';
import { UserAvatar } from './user';

const Autocomplete: React.FC<any> = forwardRef(
  ({ data, isLoading, isSuccess, value, onChange, renderIcon, fetchNextPage }, ref) => {
    useEffect(() => console.log('@render Autocomplete'));

    const inputRef = useAnimatedRef<View>();
    const position = useSharedValue({ top: 0, left: 0, width: 0, height: 0 });
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const updatePosition = () => {
      runOnUI(() => {
        'worklet';
        const measured = measure(inputRef);
        if (measured) {
          position.value = {
            top: measured.pageY + measured.height,
            left: measured.pageX,
            width: measured.width,
            height: measured.height,
          };
        }
      })();
    };

    useImperativeHandle(ref, () => ({
      close: () => setIsOpen(false),
      updatePosition,
    }));

    const animatedStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      top: position.value.top,
      left: position.value.left,
      width: position.value.width,
      flex: 1,
    }));

    useEffect(() => {
      setIsOpen(isSuccess);
    }, [isSuccess]);

    const renderItem = ({ item }: any) => {
      return (
        <TouchableHighlight onPress={() => router.push(`/posts/${item.documentId}`)}>
          <Card size="sm">
            <HStack className="items-center justify-between">
              <Text>{item.title}</Text>
              <UserAvatar user={item.author}></UserAvatar>
            </HStack>
          </Card>
        </TouchableHighlight>
      );
    };

    const renderEmptyComponent = (
      <Card size="sm" className="items-center justify-between">
        <Text>暂无数据</Text>
      </Card>
    );

    const renderItemSeparator = () => <Divider orientation="horizontal" />;

    return (
      <>
        <Animated.View
          ref={inputRef}
          onLayout={updatePosition} // 初始布局时更新位置
        >
          <Input size="lg" variant="rounded" className="w-full">
            <InputSlot className="ml-3">
              <InputIcon as={Search} />
            </InputSlot>
            <InputField
              value={value}
              onChangeText={(text: string) => onChange(text)}
              onBlur={() => setIsOpen(false)}
              onFocus={() => setIsOpen(isSuccess)}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {isLoading && <Spinner />}
            <InputSlot className="mx-3">
              <InputIcon as={renderIcon} />
            </InputSlot>
          </Input>
        </Animated.View>
        <Portal isOpen={isOpen}>
          <Animated.View style={[animatedStyle]} className="bg-background-100">
            <FlatList
              className="flex-1"
              data={data}
              keyExtractor={(item) => item.documentId}
              renderItem={renderItem}
              ListEmptyComponent={renderEmptyComponent}
              ItemSeparatorComponent={renderItemSeparator}
              showsVerticalScrollIndicator={false}
              onEndReached={() => fetchNextPage()}
            />
          </Animated.View>
        </Portal>
      </>
    );
  },
);

export default Autocomplete;
