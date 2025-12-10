import Link from "next/link";
import type { ArticleItem } from "@/types"


interface Props{
    category: string
    articles: ArticleItem[]
}


const ArticleItemList = ({ category, articles }: Props) =>{
    return (
        <div className="flex flex-col gap-3 bg-white rounded-lg shadow-sm p-4 mb-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <h2 className="font-poppins font-semibold text-xl">{category}</h2>
            <div className="flex flex-col gap-1.5 font-poppins text-base">
                {articles.map((article, id) => (
                    <Link
                        href={`/${article.id}`}
                        key={id}
                        className="text-neutral-600 hover:text-red-600 transition duration-150">
                        {article.title}
                    </Link>
                ))}

            </div>
        </div>
    )
}

export default ArticleItemList;