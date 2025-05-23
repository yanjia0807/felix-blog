import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export const ListEmptyView: React.FC<any> = ({ text = '暂无数据' }) => {
  return (
    <View className="mt-32 flex-1 items-center">
      <Text>{text}</Text>
    </View>
  );
};
