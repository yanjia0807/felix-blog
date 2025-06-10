import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface PostDrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const PostDrawerContext = createContext<PostDrawerContextType | undefined>(undefined);

export const PostDrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
    }),
    [open, close, isOpen],
  );

  return <PostDrawerContext.Provider value={value}>{children}</PostDrawerContext.Provider>;
};

export const usePostDrawerContext = () => {
  const context = useContext(PostDrawerContext);
  if (!context) {
    throw new Error('usePostDrawerContext must be used within a PostDrawerProvider');
  }
  return context;
};
