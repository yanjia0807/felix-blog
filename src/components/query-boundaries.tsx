import { QueryErrorResetBoundary } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './error-fallback';
import PageSpinner from './page-spinner';

export const QueryBoundaries: React.FC<any> = ({ children, fallbackComponent }) => {
  const renderFallback = useCallback(
    () => fallbackComponent || <PageSpinner />,
    [fallbackComponent],
  );

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallback}>
          <React.Suspense fallback={renderFallback()}>{children}</React.Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};
