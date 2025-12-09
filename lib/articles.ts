import fs from "fs";
import matter from "gray-matter";
import path from "path";
import moment from "moment";
import { remark } from "remark";
import html from "remark-html";

import type { ArticleItem } from "@/types";


const articlesDirectory = path.join(process.cwd(), "articles");


const getSortedArticles = (): ArticleItem[] => {
    const fileNames = fs.readdirSync(articlesDirectory);

    const allArticlesData = fileNames.map((fileName) => {
        const id = fileName.replace(/\.mdx$/, "");

        const fullPath = path.join(articlesDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");

        const matterResult = matter(fileContents);

        return{
            id,
            title: matterResult.data.title,
            date: matterResult.data.publishedAt,
            category: matterResult.data.category,
            summary: matterResult.data.summary,
        }
    })

    return allArticlesData .sort((a, b) => {
        const format = "DD-MM-YYYY";
        const dateOne = moment(a.date, format);
        const dateTwo = moment(b.date, format);
        return dateTwo.diff(dateOne); // que hace? -> ordena de mayor a menor
    });
}

export const getCategorisedArticles = (): Record<string, ArticleItem[]> => {
    const sortedArticles = getSortedArticles();

    const categorisedArticles: Record<string, ArticleItem[]> = {};

    sortedArticles.forEach((article) => {
        if (!categorisedArticles[article.category]){
            categorisedArticles[article.category] = [];
        }
        categorisedArticles[article.category].push(article);
    })


    return categorisedArticles;
}


export const getAllArticles = () => {
    const sortedArticles = getSortedArticles();
    
    return sortedArticles.map((article) => ({
        slug: article.id,
        metadata: {
            title: article.title,
            publishedAt: article.date,
            category: article.category,
            summary: article.summary,
        }
    }));
}

export const getArticleData = async (id: string) => {
    const fullPath = path.join(articlesDirectory, `${id}.mdx`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const matterResult = matter(fileContents);

    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    
    const contentHtml = processedContent.toString();

    return {
        id,
        contentHtml,
        title: matterResult.data.title,
        date: moment(matterResult.data.publishedAt).format("DD-MM-YYYY"),
        category: matterResult.data.category,
        summary: matterResult.data.summary,
    }
}