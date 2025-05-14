import { memo, useEffect } from 'react';
import _ from 'lodash';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { useFetchRelatedComments } from '../api';
import { collapseComment, selectIsCommentExpanded } from '../store';

export const CommentSectionFooter: React.FC<any> = memo(
  ({ item }) => {
    useEffect(() => console.log('@render CommentSectionFooter'));

    const postDocumentId = item.post.documentId;
    const commentDocumentId = item.documentId;

    const dispatch = useAppDispatch();

    const isExpanded = useAppSelector((state) =>
      selectIsCommentExpanded(state, { postDocumentId, commentDocumentId }),
    );

    const relatedCommentQuery = useFetchRelatedComments({
      postDocumentId,
      commentDocumentId,
      enabled: item.relatedComments.count > 0,
    });

    const onExpandMore = () => {
      if (relatedCommentQuery.hasNextPage && !relatedCommentQuery.isFetchingNextPage) {
        relatedCommentQuery.fetchNextPage();
      }
    };

    const onCollapse = () => {
      dispatch(collapseComment({ postDocumentId, commentDocumentId }));
    };

    return (
      <HStack className="items-center pl-12">
        <HStack className="items-center" space="md">
          {relatedCommentQuery.hasNextPage && isExpanded && (
            <Button size="sm" variant="link" action="secondary" onPress={() => onExpandMore()}>
              <ButtonText>展开更多</ButtonText>
            </Button>
          )}
          {item.relatedComments?.count > 0 && isExpanded && (
            <Button size="sm" variant="link" action="secondary" onPress={() => onCollapse()}>
              <ButtonText>收起</ButtonText>
            </Button>
          )}
        </HStack>
      </HStack>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.title === nextProps.item.title,
      prevProps.item.relatedComments.count === nextProps.item.relatedComments.count
    );
  },
);
