'use client';

import type { VisitStatus } from '@/types';

interface StatusBadgeProps {
  status: VisitStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'En attente',
          bgColor: 'rgba(245,158,11,0.15)',
          textColor: '#f59e0b',
          glowColor: 'rgba(245,158,11,0.3)',
        };
      case 'confirmed':
        return {
          label: 'Confirmée',
          bgColor: 'rgba(34,197,94,0.15)',
          textColor: '#22c55e',
          glowColor: 'rgba(34,197,94,0.3)',
        };
      case 'cancelled':
        return {
          label: 'Annulée',
          bgColor: 'rgba(239,68,68,0.15)',
          textColor: '#ef4444',
          glowColor: 'rgba(239,68,68,0.3)',
        };
      default:
        return {
          label: status,
          bgColor: 'rgba(255,255,255,0.1)',
          textColor: '#f0f0f0',
          glowColor: 'rgba(255,255,255,0.2)',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className="px-3 py-1 rounded-full text-sm font-medium"
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        boxShadow: `0 0 10px ${config.glowColor}`,
      }}
    >
      {config.label}
    </div>
  );
}
