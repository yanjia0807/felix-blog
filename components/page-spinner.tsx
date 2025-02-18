import React from 'react';
import { Spinner } from './ui/spinner';

const PageSpinner = ({ isVisiable }: any) => {
  return isVisiable && <Spinner className="absolute left-1/2 top-1/2 z-10" />;
};

export default PageSpinner;
