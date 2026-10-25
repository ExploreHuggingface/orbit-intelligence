import type { Metadata } from 'next';
import { ResetPasswordNotice } from '@/components/auth/reset-password-notice';

export const metadata: Metadata = { title: 'Reset password' };

export default function ResetPasswordPage() {
  return <ResetPasswordNotice />;
}
