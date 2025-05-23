import { MessageCircle } from 'lucide-react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { setPostDocumentId } from '@/features/comment/store/comment-sheet-slice';
import { useAppDispatch } from '@/store/hook';
import { useCommentSheetContext } from './comment-sheet-provider';

export const CommentIcon: React.FC<any> = ({ post }) => {
  const { open } = useCommentSheetContext();
  const dispatch = useAppDispatch();

  const onInputIconPress = () => {
    dispatch(setPostDocumentId({ postDocumentId: post.documentId }));
    open();
  };

  return (
    <Button variant="link" action="secondary" onPress={() => onInputIconPress()}>
      <HStack space="xs" className="items-center">
        <ButtonIcon as={MessageCircle} />
        <ButtonText size="sm">评论{`(${post.comments.count})`}</ButtonText>
      </HStack>
    </Button>
  );
};
