import Link from 'next/link';
import { getAllArticles } from '@/lib/articles';

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <section className="mx-auto w-11/12 md:w-1/2 mt-10 mb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-bold font-serif text-center">Todos los Artículos</h1>
      </header>

      <div className="flex flex-col gap-6">
        {articles.map((article) => (
          <Link
            href={`/${article.slug}`}
            key={article.slug}
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-neutral-200"
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
        ))}
      </div>
    </section>
  );
}
