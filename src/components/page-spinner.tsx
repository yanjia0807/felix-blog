import React from 'react';
import { View } from 'react-native';
import { Spinner } from './ui/spinner';

const PageSpinner: React.FC<any> = () => {
  return (
    <View className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
      <Spinner />
    </View>
  );
};

export default PageSpinner;
