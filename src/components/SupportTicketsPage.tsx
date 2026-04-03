import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2, CheckCircle } from 'lucide-react';
import { supportTicketsApi } from '../lib/api';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  user_name: string;
  user_email: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    subject: '',
    description: '',
    user_name: '',
    user_email: '',
    priority: 'medium',
    category: 'general',
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await supportTicketsApi.getAll();
      setTickets(response.data || []);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!form.subject || !form.description || !form.user_name || !form.user_email) return;

    try {
      await supportTicketsApi.create(form);
      setForm({
        subject: '',
        description: '',
        user_name: '',
        user_email: '',
        priority: 'medium',
        category: 'general',
      });
      await fetchTickets();
    } catch (error) {
      console.error('Error creating support ticket:', error);
    }
  };

  const markResolved = async (id: string) => {
    try {
      await supportTicketsApi.update(id, { status: 'resolved', resolved_at: new Date().toISOString() });
      await fetchTickets();
    } catch (error) {
      console.error('Error updating support ticket:', error);
    }
  };

  const removeTicket = async (id: string) => {
    try {
      await supportTicketsApi.delete(id);
      await fetchTickets();
    } catch (error) {
      console.error('Error deleting support ticket:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Yukleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Destek & Şikayet Yönetimi</h1>
          <p className="text-gray-600">Gelen destek talepleri ve şikayetleri yönetin</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Konu"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="md:col-span-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Aciklama"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Ad"
            value={form.user_name}
            onChange={(e) => setForm({ ...form, user_name: e.target.value })}
            className="md:col-span-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            placeholder="E-posta"
            value={form.user_email}
            onChange={(e) => setForm({ ...form, user_email: e.target.value })}
            className="md:col-span-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={createTicket}
            className="md:col-span-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Ekle
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {tickets.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Henüz destek talebi bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2">No</th>
                  <th className="text-left py-3 px-2">Konu</th>
                  <th className="text-left py-3 px-2">Kullanici</th>
                  <th className="text-left py-3 px-2">Oncelik</th>
                  <th className="text-left py-3 px-2">Durum</th>
                  <th className="text-left py-3 px-2">Tarih</th>
                  <th className="text-left py-3 px-2">Islem</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100">
                    <td className="py-3 px-2 text-sm">{ticket.ticket_number}</td>
                    <td className="py-3 px-2 text-sm">{ticket.subject}</td>
                    <td className="py-3 px-2 text-sm">{ticket.user_name}</td>
                    <td className="py-3 px-2 text-sm">{ticket.priority}</td>
                    <td className="py-3 px-2 text-sm">{ticket.status}</td>
                    <td className="py-3 px-2 text-sm">{new Date(ticket.created_at).toLocaleString('tr-TR')}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => markResolved(ticket.id)}
                          className="p-2 rounded hover:bg-green-50 text-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeTicket(ticket.id)}
                          className="p-2 rounded hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
