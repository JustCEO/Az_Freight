import { STATUS_LABELS, INVOICE_STATUS_LABELS } from '@/lib/constants';

const STATUS_STYLES: Record<string, string> = {
  request: 'bg-slate-100 text-slate-600',
  confirmed: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-amber-100 text-amber-700',
  customs: 'bg-orange-100 text-orange-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  // статусы инвойсов
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  partially_paid: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  // статусы запросов
  new: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-amber-100 text-amber-700',
  quoted: 'bg-purple-100 text-purple-700',
  converted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

const ALL_LABELS: Record<string, string> = {
  ...STATUS_LABELS,
  ...INVOICE_STATUS_LABELS,
  new: 'New',
  reviewing: 'Reviewing',
  quoted: 'Quoted',
  converted: 'Converted',
  rejected: 'Rejected',
};

interface StatusBadgeProps {
  status: string;
  // Поддержка кастомного цвета
  customColor?: string;
  customLabel?: string;
}

export default function StatusBadge({ status, customColor, customLabel }: StatusBadgeProps) {
  if (customColor) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: customColor }}
      >
        {customLabel || status}
      </span>
    );
  }

  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600';
  const label = ALL_LABELS[status] || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
