import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3 text-text-muted">
        <Loader2 className="w-7 h-7 animate-spin text-accent" />
        <p className="text-sm">Loading dashboard…</p>
      </div>
    </div>
  );
}
