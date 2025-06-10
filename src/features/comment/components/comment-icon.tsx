import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { MessageCircle } from 'lucide-react-native';
import React from 'react';
import { useCommentActions } from '../store';
import { useCommentSheetContext } from './comment-sheet-provider';

export const CommentIcon: React.FC<any> = ({ postDocumentId, commentCount }) => {
  const { open } = useCommentSheetContext();
  const { setCommentPostDocumentId } = useCommentActions();

  const onInputIconPress = () => {
    open();
    setCommentPostDocumentId(postDocumentId);
  };

  return (
    <Button variant="link" action="secondary" onPress={onInputIconPress}>
      <HStack space="xs" className="items-center">
        <ButtonIcon as={MessageCircle} />
        <ButtonText size="sm">评论{`(${commentCount})`}</ButtonText>
      </HStack>
    </Button>
  );
};
