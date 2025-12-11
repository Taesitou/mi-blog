import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const { slug, title, date, category, content } = await request.json();

    if (!slug || !title || !date || !category || !content) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Get current file to get SHA
    const getResponse = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/articles/${slug}.mdx`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error('No se pudo obtener el archivo actual');
    }

    const fileData = await getResponse.json();
    const sha = fileData.sha;

    // Create updated MDX content
    const mdxContent = `---
title: "${title}"
publishedAt: "${date}"
category: "${category}"
---

${content}`;

    // Update file on GitHub
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/articles/${slug}.mdx`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update article: ${title}`,
          content: Buffer.from(mdxContent).toString('base64'),
          sha: sha,
          branch: process.env.GITHUB_BRANCH || 'master',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Artículo actualizado exitosamente. Vercel redesplegará automáticamente.',
      data,
    });
  } catch (error) {
    console.error('Error al actualizar el artículo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el artículo en GitHub' },
      { status: 500 }
    );
  }
}
