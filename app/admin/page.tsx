'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const handleAuth = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminAuth', 'true');
        setIsAuthorized(true);
        window.dispatchEvent(new Event('storage'));
      } else {
        alert('Contraseña incorrecta');
      }
    } catch (error) {
      alert('Error al validar contraseña');
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthorized(false);
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4 font-serif text-center">Acceso Restringido</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full p-3 border border-neutral-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          />
          <button
            onClick={handleAuth}
            className="w-full bg-neutral-900 text-white p-3 rounded-lg hover:bg-neutral-800"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  const handleFileUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/posts/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Archivo subido exitosamente: ${data.slug}`);
        setFile(null);
        router.refresh();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error al subir el archivo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-serif">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Cerrar Sesión
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

    <div className="mt-12 pt-8 border-t border-neutral-300">
      <h2 className="text-2xl font-bold mb-4 font-serif">O también subir archivo:</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold">Selecciona un archivo .md o .mdx</label>
          <input
            type="file"
            accept=".md,.mdx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>
        <button
          type="button"
          onClick={handleFileUpload}
          disabled={!file || loading}
          className="bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
      </div>
    </div>
  </div>
  );
}