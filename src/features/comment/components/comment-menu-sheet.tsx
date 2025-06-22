import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useToast from '@/hooks/use-toast';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import { useRouter } from 'expo-router';
import { Copy, MessageCircleReply, MessageSquareWarning, Search } from 'lucide-react-native';
import React, { memo, useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { useCommentActions, useCommentPostDocumentId, useSelectComment } from '../store';

export const CommentMenuSheet: React.FC<any> = memo(function CommentMenuSheet({
  menuRef,
  inputRef,
  close,
  closeMenu,
  openSub,
  onChange,
}) {
  const postDocumentId = useCommentPostDocumentId();
  const selectComment = useSelectComment();
  const { setReplyComment } = useCommentActions();
  const snapPoints = useMemo(() => ['50%'], []);
  const router = useRouter();
  const toast = useToast();

  const onReport = () => {
    closeMenu();
    openSub();
  };

  const onCopyText = () => {
    Clipboard.setString(selectComment.content);
    toast.info({
      description: '已复制',
    });
  };

  const onReply = () => {
    const replyComment = {
      documentId: selectComment.documentId,
      topDocumentId: selectComment.topComment
        ? selectComment.topComment.documentId
        : selectComment.documentId,
      username: selectComment.user.username,
    };
    setReplyComment(replyComment);

    setTimeout(() => inputRef.current?.focus(), 300);
    closeMenu();
  };

  const onSearch = () => {
    router.push('/posts/search');
    close();
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
      <VStack className="flex-1 bg-background-50 p-4" space="sm">
        <Card size="sm">
          <TouchableOpacity onPress={onCopyText}>
            <HStack className="items-center p-2" space="sm">
              <Icon as={Copy} />
              <Text>复制该评论</Text>
            </HStack>
          </TouchableOpacity>
        </Card>
        <Card size="sm">
          <VStack space="sm">
            <TouchableOpacity onPress={onReply}>
              <HStack className="items-center p-2" space="sm">
                <Icon as={MessageCircleReply} />
                <Text>发作品回复</Text>
              </HStack>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity onPress={onSearch}>
              <HStack className="items-center p-2" space="sm">
                <Icon as={Search} />
                <Text>搜索</Text>
              </HStack>
            </TouchableOpacity>
          </VStack>
        </Card>
        <Card size="sm">
          <TouchableOpacity onPress={() => onReport()}>
            <HStack className="items-center p-2" space="sm">
              <Icon as={MessageSquareWarning} />
              <Text>举报</Text>
            </HStack>
          </TouchableOpacity>
        </Card>
      </VStack>
    </BottomSheet>
  );
});
