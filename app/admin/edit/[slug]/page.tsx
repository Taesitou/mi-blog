'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth !== 'true') {
      router.push('/admin');
      return;
    }
    setIsAuthorized(true);

    // Fetch article content from GitHub
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/posts/get?slug=${resolvedParams.slug}`);

        if (response.ok) {
          const data = await response.json();
          
          setTitle(data.title);
          setDate(data.date);
          setCategory(data.category);
          setContent(data.content);
        } else {
          alert('Error al cargar el artículo');
          router.push('/articles');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el artículo');
        router.push('/articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [resolvedParams.slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/posts/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: resolvedParams.slug,
          title,
          date,
          category,
          content,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Artículo actualizado exitosamente');
        router.push('/articles');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error al actualizar el artículo');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthorized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-serif">Editar Artículo</h1>
        <button
          onClick={() => router.push('/articles')}
          className="bg-neutral-200 text-neutral-900 px-4 py-2 rounded-lg hover:bg-neutral-300"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
            placeholder="Mi artículo editado"
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
            disabled={saving}
            className="bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/articles')}
            className="bg-neutral-200 text-neutral-900 px-6 py-3 rounded-lg hover:bg-neutral-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
