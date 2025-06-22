import { ListEmptyView } from '@/components/list-empty-view';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { FlatList } from '@/components/ui/flat-list';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useFetchReportLegals } from '@/features/report/api/use-fetch-report-legals';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import _ from 'lodash';
import { CheckIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ReportPage: React.FC<any> = () => {
  const [selectedItem, setSelectedItem] = useState<any>();
  const { contentRelation, contentDocumentId }: any = useLocalSearchParams();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const reportLegalsQuery = useFetchReportLegals();
  const reportLegals = _.flatMap(reportLegalsQuery.data?.pages, (page) => page.data);

  const onSelect = (item) => {
    setSelectedItem(item);
  };

  const onNextStep = () => {
    router.push({
      pathname: '/reports/submit',
      params: {
        contentRelation,
        contentDocumentId,
        legalDocumentId: selectedItem?.documentId,
      },
    });
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity onPress={() => onSelect(item)}>
        <Card size="md" variant="ghost">
          <VStack space="md">
            <HStack className="items-center justify-between">
              <Text size="md">{item.word}</Text>
              {selectedItem?.documentId === item.documentId && <Icon as={CheckIcon} />}
            </HStack>
            {selectedItem?.documentId === item.documentId && (
              <Text sub={true}>{item.description}</Text>
            )}
          </VStack>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = <ListEmptyView />;

  const renderItemSeparator = (props: any) => <Divider {...props} />;

  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  let title = '举报';
  if (contentRelation === 'post') {
    title = '举报帖子';
  } else if (contentRelation === 'user') {
    title = '举报用户';
  }

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <SafeAreaView className="flex-1">
        <FlatList
          data={reportLegals}
          contentContainerClassName="p-4"
          renderItem={renderItem}
          ItemSeparatorComponent={renderItemSeparator}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
        />

        <HStack
          className="absolute bottom-0 items-center p-4"
          style={{ paddingBottom: insets.bottom }}>
          <Button className="flex-1" onPress={onNextStep}>
            <ButtonText>下一步</ButtonText>
          </Button>
        </HStack>
      </SafeAreaView>
    </>
  );
};

export default ReportPage;
