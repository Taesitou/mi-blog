import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
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
    const { title, date, category, summary, content } = await request.json();

    // Validar campos requeridos
    if (!title || !date || !category || !summary || !content) {
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
summary: "${summary}"
---

${content}`;

    // Guardar archivo en la carpeta articles
    const articlesPath = path.join(process.cwd(), 'articles');
    const filePath = path.join(articlesPath, `${slug}.mdx`);

    // Verificar si el archivo ya existe
    try {
      await fs.access(filePath);
      return NextResponse.json(
        { error: 'Ya existe un artículo con ese título' },
        { status: 409 }
      );
    } catch {
      // El archivo no existe, podemos crearlo
    }

    // Crear el archivo
    await fs.writeFile(filePath, mdxContent, 'utf-8');

    return NextResponse.json({
      success: true,
      slug,
      message: 'Post creado exitosamente',
    });
  } catch (error) {
    console.error('Error al crear el post:', error);
    return NextResponse.json(
      { error: 'Error al crear el post' },
      { status: 500 }
    );
  }
}
