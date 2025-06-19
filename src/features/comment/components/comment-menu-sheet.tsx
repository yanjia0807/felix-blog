import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Copy, MessageCircleReply, MessageSquareWarning, Search } from 'lucide-react-native';
import React, { memo, useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { useCommentPostDocumentId } from '../store';

export const CommentMenuSheet: React.FC<any> = memo(function CommentMenuSheet({
  menuRef,
  close,
  openSub,
  onChange,
}) {
  const postDocumentId = useCommentPostDocumentId();
  const snapPoints = useMemo(() => ['50%'], []);

  const onReport = () => {
    close();
    openSub();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={'close'}
      />
    ),
    [],
  );

  if (!postDocumentId) return null;

  return (
    <BottomSheet
      ref={menuRef}
      index={-1}
      onAnimate={onChange}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}>
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <Card size="sm">
          <TouchableOpacity>
            <HStack className="items-center p-2" space="md">
              <Icon as={Copy} />
              <Text>复制该评论</Text>
            </HStack>
          </TouchableOpacity>
        </Card>
        <Card size="sm">
          <TouchableOpacity>
            <HStack className="items-center p-2" space="md">
              <Icon as={MessageCircleReply} />
              <Text>发作品回复</Text>
            </HStack>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity>
            <HStack className="items-center p-2" space="md">
              <Icon as={Search} />
              <Text>搜索</Text>
            </HStack>
          </TouchableOpacity>
        </Card>
        <Card size="sm">
          <TouchableOpacity onPress={() => onReport()}>
            <HStack className="items-center p-2" space="md">
              <Icon as={MessageSquareWarning} />
              <Text>举报</Text>
            </HStack>
          </TouchableOpacity>
        </Card>
      </VStack>
    </BottomSheet>
  );
});
