import _ from 'lodash';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CarouselContext = createContext<any>(undefined);

export const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a CarouselProvider');
  }
  return context;
};

export const CarouselProvider = ({ children }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>([]);
  const [index, setIndex] = useState<any>([]);

  const onOpen = useCallback((data, index = 0) => {
    setIsOpen(true);
    setData(data);
    setIndex(index);
  }, []);

  const onOpenName = useCallback((data, name) => {
    const index = _.findIndex(data, (item: any) => item.name === name);
    setIsOpen(true);
    setData(data);
    setIndex(index);
  }, []);

  const onClose = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      setIndex,
      data,
      setData,
      onOpen,
      onOpenName,
      onClose,
      isOpen,
      index,
    }),
    [onOpen, onOpenName, onClose, isOpen, data, index],
  );

  return <CarouselContext.Provider value={value}>{children}</CarouselContext.Provider>;
};
