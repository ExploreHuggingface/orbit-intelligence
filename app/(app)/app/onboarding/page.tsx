import { requireUser } from '@/lib/auth/server';
import { OnboardingFlow } from '@/components/app/onboarding-flow';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Welcome' };

export default async function OnboardingPage() {
  const user = await requireUser('/app/onboarding');
  // Skip onboarding entirely once completed (plan §23).
  if (user.profile.onboarded_at) redirect('/app/overview');
  return (
    <OnboardingFlow
      initialStep={user.profile.onboarding_step}
      initialInterests={user.profile.interests}
      completed={Boolean(user.profile.onboarded_at)}
    />
  );
}
