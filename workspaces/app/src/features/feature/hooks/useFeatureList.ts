import useSWR from 'swr';

import { featureApiClient } from '../apiClient/featureApiClient';

export function useFeatureList(options, fallbackData) {
  return useSWR(featureApiClient.fetchList$$key(options), () => featureApiClient.fetchList(options), { suspense: true, fallbackData });
}