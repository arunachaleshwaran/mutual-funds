import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

function noErrorParse<T>(data: string): T | string {
  try {
    return JSON.parse(data) as T;
  } catch {
    return data;
  }
}
/**
 * Like a observable's can able to process the stream of data
 * each chunk is consider as a full state.
 * @param url API URL for fetch
 * @param option API option for fetch
 * @param knownErrors List of known errors can shown on UI
 */
export default function useFetchEvent<T>(
  url: Parameters<typeof fetch>[0],
  option: Parameters<typeof fetch>[1],
  knownErrors: Readonly<Array<string>>
) {
  const apiRequest = useMemo(async () => fetch(url, option), []);
  /** Last state of API */
  const [state, setState] = useState<T | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  useQuery({
    queryKey: [url],
    queryFn: async () => {
      const response = await apiRequest;
      const reader = response.body!.getReader();
      const asyncIterable = {
        [Symbol.asyncIterator]: () => ({
          next: async () => {
            const { done, value } = await reader.read();
            return { done, value };
          },
        }),
      };
      const textDecoder = new TextDecoder();
      for await (const buffer of asyncIterable) {
        const value = noErrorParse<T>(
          /**
           * Decode and use the latest chunk.
           * Some time in name of efficiency the multiple chunk processed into one
           */
          textDecoder.decode(buffer).split('\n').pop()!
        );
        if (typeof value === 'string') {
          if (knownErrors.includes(value)) setApiError(value);
          else setApiError(() => 'Unknown error');
        } else setState(() => value);
      }
    },
  });
  return [state, apiError] as const;
}
