"use client";

import { useEffect, useState } from "react";

interface UsePageLoadingOptions {
  initialDelay?: number;
  minimumLoadingTime?: number;
}

/**
 * Hook to manage page loading states
 * @param options Configuration options
 * @returns Object containing loading state and handler functions
 */
const usePageLoading = ({
  initialDelay = 300,
  minimumLoadingTime = 300,
}: UsePageLoadingOptions = {}) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  // Handle initial page loading simulation
  useEffect(() => {
    if (!initialLoading) return;

    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [initialDelay, initialLoading]);

  /**
   * Start loading state with minimum display time
   */
  const startLoading = () => {
    setLoadingStartTime(Date.now());
    setIsLoading(true);
  };

  /**
   * End loading state with respect to minimum display time
   */
  const endLoading = () => {
    if (loadingStartTime) {
      const elapsedTime = Date.now() - loadingStartTime;
      if (elapsedTime < minimumLoadingTime) {
        // Wait for the minimum loading time before ending
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStartTime(null);
        }, minimumLoadingTime - elapsedTime);
        return;
      }
    }
    setIsLoading(false);
    setLoadingStartTime(null);
  };

  /**
   * Run an async operation with loading state
   * @param asyncOperation The async function to execute
   * @returns The result of the async operation
   */
  const withLoading = async <T>(
    asyncOperation: () => Promise<T>,
  ): Promise<T> => {
    try {
      startLoading();
      return await asyncOperation();
    } finally {
      endLoading();
    }
  };

  return {
    initialLoading,
    isLoading,
    startLoading,
    endLoading,
    withLoading,
  };
};

export default usePageLoading;
