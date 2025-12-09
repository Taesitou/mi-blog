import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Verificar que sea .md o .mdx
    const fileName = file.name;
    if (!fileName.endsWith('.md') && !fileName.endsWith('.mdx')) {
      return NextResponse.json(
        { error: 'El archivo debe ser .md o .mdx' },
        { status: 400 }
      );
    }

    // Leer el contenido del archivo
    const fileContent = await file.text();

    // Generar slug desde el nombre del archivo (sin extensión)
    const slug = fileName
      .replace(/\.(md|mdx)$/, '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Subir a GitHub
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/articles/${slug}.mdx`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload article: ${slug}`,
          content: Buffer.from(fileContent).toString('base64'),
          branch: process.env.GITHUB_BRANCH || 'main',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      
      if (response.status === 422) {
        return NextResponse.json(
          { error: 'Ya existe un artículo con ese nombre' },
          { status: 409 }
        );
      }
      
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      slug,
      message: 'Archivo subido exitosamente. Vercel redesplegará automáticamente.',
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo a GitHub' },
      { status: 500 }
    );
  }
}
