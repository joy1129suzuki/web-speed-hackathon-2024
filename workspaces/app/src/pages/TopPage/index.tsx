import React, { Suspense, lazy, useEffect, useState, useId } from 'react';
import { format, startOfToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { releaseApiClient } from '../../features/release/apiClient/releaseApiClient';
import { rankingApiClient } from '../../features/ranking/apiClient/rankingApiClient';
import { useFeatureList } from '../../features/feature/hooks/useFeatureList';
import { BookCard } from '../../features/book/components/BookCard';
import { FeatureCard } from '../../features/feature/components/FeatureCard';
import { RankingCard } from '../../features/ranking/components/RankingCard';
import { Box } from '../../foundation/components/Box';
import { Flex } from '../../foundation/components/Flex';
import { Spacer } from '../../foundation/components/Spacer';
import { Text } from '../../foundation/components/Text';
import { Color, Space, Typography } from '../../foundation/styles/variables';

// CoverSectionを動的にインポート
const CoverSection = lazy(() => import('./internal/CoverSection'));

const TopPage: React.FC = () => {
  const [releaseData, setReleaseData] = useState(null);
  const [rankingList, setRankingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // フォールバックデータを定義
  const fallbackFeatureListData = {
    features: [] // フォールバック時は空のリストを使用
  };

  // useFeatureListフックにフォールバックデータを渡す
  const { data: featureList, error: featureListError } = useFeatureList({ query: {} }, fallbackFeatureListData);

  const today = startOfToday();
  const todayStr = format(today, 'EEEE', { locale: ja }).toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const releaseResponse = await releaseApiClient.fetch({ params: { dayOfWeek: todayStr } });
        const rankingResponse = await rankingApiClient.fetchList({ query: {} });
        setReleaseData(releaseResponse);
        setRankingList(rankingResponse.rankings);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [todayStr]);

  const pickupA11yId = useId();
  const rankingA11yId = useId();
  const todayA11yId = useId();

  if (loading) return <div>Loading...</div>;
  if (error || featureListError) return <div>Error loading data</div>;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Flex align="flex-start" direction="column" gap={Space * 2} justify="center" pb={Space * 2}>
      <Box as="header" maxWidth="100%" width="100%">
          <CoverSection />
        </Box>
        <Box as="main" maxWidth="100%" width="100%">
          {/* ピックアップセクション */}
          <Box aria-labelledby={pickupA11yId} as="section" maxWidth="100%" mt={16} width="100%">
            <Text as="h2" color={Color.MONO_100} id={pickupA11yId} typography={Typography.NORMAL20} weight="bold">
              ピックアップ
            </Text>
            <Spacer height={Space * 2} />
            <Box maxWidth="100%" overflowX="scroll" overflowY="hidden">
              <Flex align="stretch" direction="row" gap={Space * 2} justify="flex-start">
                {featureList && featureList.features.map((feature) => (
                  <FeatureCard key={feature.id} bookId={feature.book.id} />
                ))}
              </Flex>
            </Box>
          </Box>

          {/* ランキングセクション */}
          <Spacer height={Space * 2} />
          <Box aria-labelledby={rankingA11yId} as="section" maxWidth="100%" width="100%">
            <Text as="h2" color={Color.MONO_100} id={rankingA11yId} typography={Typography.NORMAL20} weight="bold">
              ランキング
            </Text>
            <Spacer height={Space * 2} />
            <Box maxWidth="100%" overflowX="hidden" overflowY="hidden">
              <Flex align="center" as="ul" direction="column" justify="center">
                {rankingList && rankingList.map((ranking) => (
                  <RankingCard key={ranking.id} bookId={ranking.book.id} />
                ))}
              </Flex>
            </Box>
          </Box>

          {/* 本日更新セクション */}
          <Spacer height={Space * 2} />
          <Box aria-labelledby={todayA11yId} as="section" maxWidth="100%" width="100%">
            <Text as="h2" color={Color.MONO_100} id={todayA11yId} typography={Typography.NORMAL20} weight="bold">
              本日更新
            </Text>
            <Spacer height={Space * 2} />
            <Box maxWidth="100%" overflowX="scroll" overflowY="hidden">
              <Flex align="stretch" gap={Space * 2} justify="flex-start">
                {releaseData && releaseData.books.map((book) => (
                  <BookCard key={book.id} bookId={book.id} />
                ))}
              </Flex>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Suspense>
  );
};

export default TopPage;