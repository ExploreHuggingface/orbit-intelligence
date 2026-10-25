import { requireUser } from '@/lib/auth/server';
import { listVideoReviews } from '@/lib/data/misc';
import { VideoReviewsGrid } from '@/components/app/video-reviews-grid';

export const metadata = { title: 'Video Reviews' };

export default async function VideoReviewsPage() {
  const user = await requireUser('/app/video-reviews');
  const videos = listVideoReviews(user.id);
  return <VideoReviewsGrid videos={videos} />;
}
