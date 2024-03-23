import React, { Suspense, lazy, useId } from 'react';
import { format, startOfToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import useCachedData from '../../hooks/useCachedData';
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

// 実際のデータフェッチロジック
async function fetchReleaseData() {
  // 曜日を英語の小文字で取得（例: 'monday'）
  const dayOfWeek = format(today, 'EEEE', { locale: ja }).toLowerCase();
  // リリースデータのエンドポイントURLを組み立て
  const url = `/api/v1/releases/${dayOfWeek}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Release data fetch failed');
  }
  return await response.json();
}

async function fetchFeatureList() {
  const response = await fetch('/api/v1/features');
  if (!response.ok) {
    throw new Error('Feature list fetch failed');
  }
  return await response.json();
}

async function fetchRankingList() {
  const response = await fetch('/api/v1/rankings');
  if (!response.ok) {
    throw new Error('Ranking list fetch failed');
  }
  return await response.json();
}

const TopPage: React.FC = () => {
  const today = startOfToday();
  const todayStr = format(today, 'EEEE', { locale: ja });

  // キャッシュされたデータを使用
  const [releaseData, loadingRelease, errorRelease] = useCachedData(`release-${todayStr}`, fetchReleaseData);
  const [featureList, loadingFeatures, errorFeatures] = useCachedData('featureList', fetchFeatureList);
  const [rankingList, loadingRankings, errorRankings] = useCachedData('rankingList', fetchRankingList);

  const pickupA11yId = useId();
  const rankingA11yId = useId();
  const todayA11yId = useId();

  if (loadingRelease || loadingFeatures || loadingRankings) return <div>Loading...</div>;
  if (errorRelease || errorFeatures || errorRankings) return <div>Error loading data</div>;

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
                {featureList && featureList.map((feature) => (
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

export { TopPage as default };