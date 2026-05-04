'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Visit } from '@/types';
import StatusBadge from './StatusBadge';
import { MapPin, Calendar, FileText } from 'lucide-react';

interface VisitCardProps {
  visit: Visit;
}

export default function VisitCard({ visit }: VisitCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111318] border-l-4 border-l-[#c8a96e] border-y border-r border-[rgba(255,255,255,0.08)] rounded-r-xl p-6 hover:border-[rgba(200,169,110,0.3)] transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-[#f0f0f0] mb-2">
            {visit.properties?.title}
          </h3>
          <div className="flex items-center gap-2 text-[#8b8fa8]">
            <MapPin className="w-4 h-4 text-[#c8a96e]" />
            <span className="text-sm">{visit.properties?.location}</span>
          </div>
        </div>
        <StatusBadge status={visit.status} />
      </div>

      <div className="flex items-center gap-2 text-[#8b8fa8] mb-4">
        <Calendar className="w-4 h-4" />
        <span className="text-sm">Date de visite: {formatDate(visit.visit_date)}</span>
      </div>

      {visit.id_scan_url && (
        <Link
          href={visit.id_scan_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#c8a96e] hover:text-[#d4b87a] transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm">Voir la pièce d'identité</span>
        </Link>
      )}
    </motion.div>
  );
}
