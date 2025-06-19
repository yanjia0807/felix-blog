import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import React, { memo, useCallback, useMemo } from 'react';
import { useCommentPostDocumentId } from '../store';
import CommentReport from './comment-report';

export const CommentSubSheet: React.FC<any> = memo(function CommentSubSheet({
  subRef,
  onChange,
  close,
}) {
  const postDocumentId = useCommentPostDocumentId();
  const snapPoints = useMemo(() => ['50%'], []);

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
      ref={subRef}
      index={-1}
      onAnimate={onChange}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}>
      <CommentReport close={close} />
    </BottomSheet>
  );
});
