'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, category, summary, content }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Post creado exitosamente: ${data.slug}`);
        setTitle('');
        setDate('');
        setCategory('');
        setSummary('');
        setContent('');
        router.refresh();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error al crear el post');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 font-serif">Admin Panel</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
            placeholder="Mi nuevo artículo"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Fecha de publicación</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Categoría</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
            placeholder="software, design, tech..."
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Resumen</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 h-24"
            placeholder="Breve descripción del artículo..."
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Contenido (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 h-96 font-mono text-sm"
            placeholder="# Título&#10;&#10;Tu contenido en markdown aquí..."
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Post'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="bg-neutral-200 text-neutral-900 px-6 py-3 rounded-lg hover:bg-neutral-300"
          >
            Volver al blog
          </button>
        </div>
      </form>
    </div>
  );
}
