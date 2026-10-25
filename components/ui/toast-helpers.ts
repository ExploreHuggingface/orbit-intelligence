/* Toast helpers — one consistent voice for every mutation (plan §38). */
import { toast } from 'sonner';

export function toastSuccess(message: string, description?: string) {
  toast.success(message, { description });
}

export function toastError(message: string, description?: string) {
  toast.error(message, { description });
}

export function toastHonest(message: string, description: string) {
  // For simulation boundaries: works, but labeled honestly.
  toast(message, { description, duration: 6000 });
}

export function actionError(result: { ok: boolean; error?: string }): boolean {
  if (!result.ok) {
    toastError(result.error ?? 'Something went wrong.');
    return false;
  }
  return true;
}
