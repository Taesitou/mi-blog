'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/solid';

type Article = {
  slug: string;
  metadata: {
    title: string;
    publishedAt: string;
    category: string;
    summary: string;
  };
};

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    setIsAdmin(auth === 'true');

    // Fetch articles from API
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar artículos:', err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      return;
    }

    setDeleting(slug);

    try {
      const response = await fetch('/api/posts/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Artículo eliminado exitosamente');
        setArticles(articles.filter(a => a.slug !== slug));
        router.refresh();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error al eliminar el artículo');
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto w-11/12 md:w-1/2 mt-10 mb-20">
        <p className="text-center">Cargando artículos...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-11/12 md:w-1/2 mt-10 mb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-bold font-serif text-center">Todos los Artículos</h1>
      </header>

      <div className="flex flex-col gap-6">
        {articles.map((article) => (
          <div key={article.slug} className="relative">
            <Link
              href={`/${article.slug}`}
              className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-neutral-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-semibold font-serif">{article.metadata.title}</h2>
                <span className="text-sm text-neutral-500 px-3 py-1 bg-neutral-100 rounded-full">
                  {article.metadata.category}
                </span>
              </div>
              <p className="text-neutral-600 mb-2">{article.metadata.summary}</p>
              <time className="text-sm text-neutral-500">{article.metadata.publishedAt}</time>
            </Link>
            {isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Link
                  href={`/admin/edit/${article.slug}`}
                  className="p-2 bg-neutral-700 text-white rounded-full hover:bg-neutral-800 transition-colors"
                  title="Editar artículo"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PencilIcon className="w-5 h-5" />
                </Link>
                <button
                  onClick={(e) => handleDelete(article.slug, e)}
                  disabled={deleting === article.slug}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Eliminar artículo"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
