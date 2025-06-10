import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';

interface CommentSheetContextType {
  open: () => void;
  close: () => void;
  commentSheetRef: React.RefObject<BottomSheetModal>;
}

const CommentSheetContext = createContext<CommentSheetContextType | undefined>(undefined);

export const useCommentSheetContext = () => {
  const context = useContext(CommentSheetContext);
  if (!context) {
    throw new Error('useCommentSheetContext must be used within a CommentSheetProvider');
  }
  return context;
};

export const CommentSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const commentSheetRef = useRef<BottomSheetModal>(null);
  const open = useCallback(() => commentSheetRef.current?.present(), []);
  const close = useCallback(() => commentSheetRef.current?.close(), []);

  const value = useMemo(
    () => ({
      open,
      close,
      commentSheetRef,
    }),
    [open, close],
  );

  return <CommentSheetContext.Provider value={value}>{children}</CommentSheetContext.Provider>;
};
