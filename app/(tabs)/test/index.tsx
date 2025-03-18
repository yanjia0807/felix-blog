import * as React from 'react';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AMapSdk } from 'react-native-amap3d';
import { SafeAreaView } from 'react-native-safe-area-context';

export default () => {
  const router = useRouter();
  React.useEffect(() => {
    AMapSdk.init(
      Platform.select({
        ios: '186d3464209b74effa4d8391f441f14d',
      }),
    );
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView>
        <TouchableOpacity onPress={() => router.navigate('/test/controls')}>
          <View style={style.item}>
            <Text>指南针、比例尺、缩放按钮、定位按钮</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  item: { padding: 16 },
  itemText: { fontSize: 16 },
});
