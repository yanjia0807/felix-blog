import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { PagerView } from './pager-view';

const PagerViewContext = createContext<any>(undefined);

export const usePagerView = () => {
  const context = useContext(PagerViewContext);
  if (!context) {
    throw new Error('usePagerView must be used within a PagerViewContext');
  }
  return context;
};

export const PagerViewProvider = ({ children }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pages, setPages] = useState<any>([]);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  const nextPage = useCallback(
    () => setPageIndex((val) => (val + 1 > pages.length - 1 ? pages.length - 1 : val + 1)),
    [pages.length],
  );

  const previousPage = useCallback(() => setPageIndex((val) => (val - 1 < 0 ? 0 : val - 1)), []);

  const onOpenPage = useCallback(
    (index: number) => {
      setPageIndex(index);
      onOpen();
    },
    [onOpen],
  );

  const contextValue = useMemo(
    () => ({
      isOpen,
      pageIndex,
      pages,
      onOpen,
      onClose,
      onOpenPage,
      nextPage,
      previousPage,
      setPageIndex,
      setPages,
    }),
    [isOpen, pageIndex, pages, onOpen, onClose, onOpenPage, nextPage, previousPage],
  );

  return (
    <PagerViewContext.Provider value={contextValue}>
      <>
        {children}
        <PagerView initIndex={pageIndex} value={pages} isOpen={isOpen} onClose={onClose} />
      </>
    </PagerViewContext.Provider>
  );
};
