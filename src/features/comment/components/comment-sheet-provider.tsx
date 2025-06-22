import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

interface CommentSheetContextType {
  open: () => void;
  close: () => void;
  openMenu: (item: any) => void;
  closeMenu: () => void;
  openSub: () => void;
  closeSub: () => void;
  onMenuChange: (fromIndex: number, toIndex: number) => void;
  commentSheetRef: React.RefObject<BottomSheetModal>;
  commentMenuSheetRef: React.RefObject<BottomSheet>;
  commentSubSheetRef: React.RefObject<BottomSheet>;
  isExpanded: boolean;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const commentSheetRef = useRef<BottomSheetModal>(null);
  const commentMenuSheetRef = useRef<BottomSheet>(null);
  const commentSubSheetRef = useRef<BottomSheet>(null);

  const open = useCallback(() => commentSheetRef.current?.present(), []);
  const close = useCallback(() => commentSheetRef.current?.close(), []);

  const openMenu = useCallback(() => {
    commentMenuSheetRef.current?.expand();
  }, []);
  const closeMenu = useCallback(() => {
    commentMenuSheetRef.current?.close();
  }, []);
  const openSub = useCallback(() => {
    commentSubSheetRef.current?.expand();
  }, []);
  const closeSub = useCallback(() => {
    commentSubSheetRef.current?.close();
  }, []);

  const onMenuChange = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex === -1) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, []);

  const value = useMemo(
    () => ({
      open,
      close,
      openMenu,
      closeMenu,
      openSub,
      closeSub,
      onMenuChange,
      commentSheetRef,
      commentMenuSheetRef,
      commentSubSheetRef,
      isExpanded,
    }),
    [open, close, openMenu, closeMenu, openSub, closeSub, onMenuChange, isExpanded],
  );

  return <CommentSheetContext.Provider value={value}>{children}</CommentSheetContext.Provider>;
};
