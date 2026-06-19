import { useCallback, useRef } from "react";

export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}
