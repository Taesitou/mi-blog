import ArticleItemList from "@/components/ArticleListItem";
import { getCategorisedArticles } from "@/lib/articles";


const HomePage = () => {
  const articles = getCategorisedArticles();

  console.log(articles);
  return (
    <section className="mx-auto w-11/12 md:w-3/4 lg:w-4/5 mt-20 flex flex-col gap-16 mb-20">
      <header className="font-poppins font-bold text-6xl  text-neutral-900 text-center">
        <h1>Explora mis articulos</h1>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles !== null &&
        Object.keys(articles).map((article) => (
          <ArticleItemList
           category={article}
           articles={articles[article]}
            key={article}
           />
        )) }
      </section>
    </section>
  )
}

export default HomePage