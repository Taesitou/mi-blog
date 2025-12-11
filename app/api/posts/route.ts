import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles';

export async function GET() {
  try {
    const articles = getAllArticles();
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    return NextResponse.json(
      { error: 'Error al obtener artículos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, date, category, content } = await request.json();

    // Validar campos requeridos
    if (!title || !date || !category || !content) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Crear slug desde el título
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Crear contenido MDX con frontmatter
    const mdxContent = `---
title: "${title}"
publishedAt: "${date}"
category: "${category}"
---

${content}`;

    // Hacer commit a GitHub
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/articles/${slug}.mdx`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add article: ${title}`,
          content: Buffer.from(mdxContent).toString('base64'),
          branch: process.env.GITHUB_BRANCH || 'main',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      
      if (response.status === 422) {
        return NextResponse.json(
          { error: 'Ya existe un artículo con ese título' },
          { status: 409 }
        );
      }
      
      throw new Error(error.message);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      slug,
      message: 'Post creado exitosamente. Vercel redesplegará automáticamente en unos segundos.',
      data,
    });
  } catch (error) {
    console.error('Error al crear el post:', error);
    return NextResponse.json(
      { error: 'Error al crear el post en GitHub' },
      { status: 500 }
    );
  }
}
