import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import _ from 'lodash';
import React, { memo } from 'react';
import { useFetchRelatedComments } from '../api/use-fetch-related-comments';
import { useCommentActions, useIsCommentExpanded } from '../store';

export const CommentSectionFooter: React.FC<any> = memo(function CommentSectionFooter({ item }) {
  const postDocumentId = item.post.documentId;
  const commentDocumentId = item.documentId;
  const { user } = useAuth();
  const isCommentExpanded = useIsCommentExpanded(commentDocumentId);
  const { removeExpandCommentDocumentId } = useCommentActions();

  const relatedCommentQuery = useFetchRelatedComments({
    postDocumentId,
    commentDocumentId,
    blockUsers: _.map(user?.blockUsers, (item) => item.documentId),
  });

  const onExpandMore = () => {
    if (relatedCommentQuery.hasNextPage && !relatedCommentQuery.isFetchingNextPage) {
      relatedCommentQuery.fetchNextPage();
    }
  };

  const onCollapse = () => removeExpandCommentDocumentId(commentDocumentId);

  return (
    <HStack className="items-center pl-12">
      <HStack className="items-center" space="md">
        {relatedCommentQuery.hasNextPage && isCommentExpanded && (
          <Button size="sm" variant="link" action="secondary" onPress={() => onExpandMore()}>
            {relatedCommentQuery.isLoading && <ButtonSpinner />}
            <ButtonText>展开更多</ButtonText>
          </Button>
        )}
        {item.relatedComments?.count > 0 && isCommentExpanded && (
          <Button size="sm" variant="link" action="secondary" onPress={() => onCollapse()}>
            <ButtonText>收起</ButtonText>
          </Button>
        )}
      </HStack>
    </HStack>
  );
});
