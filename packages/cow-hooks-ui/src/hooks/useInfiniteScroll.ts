import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 20;
const SCROLL_THRESHOLD = 100;
const LOADING_DELAY = 100;

export function useInfiniteScroll<T>(items: T[]) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const displayedItems = useMemo(
    () => items.slice(0, displayCount),
    [items, displayCount],
  );

  const resetPagination = () => {
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (
      element.scrollHeight - element.scrollTop <=
        element.clientHeight + SCROLL_THRESHOLD &&
      displayCount < items.length &&
      !isLoadingMore
    ) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
        setIsLoadingMore(false);
      }, LOADING_DELAY);
    }
  };

  return {
    displayedItems,
    isLoadingMore,
    handleScroll,
    resetPagination,
    hasMore: displayCount < items.length,
  };
}
