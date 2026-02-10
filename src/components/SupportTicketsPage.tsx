import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

export default function SupportTicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Destek & Şikayet Yönetimi</h1>
          <p className="text-gray-600">Gelen destek talepleri ve şikayetleri yönetin</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Henüz destek talebi bulunmuyor</p>
      </div>
    </div>
  );
}
