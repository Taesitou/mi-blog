import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Se requiere el slug del artículo' },
        { status: 400 }
      );
    }

    // Primero obtener el SHA del archivo (requerido por GitHub)
    const getResponse = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/articles/${slug}.mdx`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    if (!getResponse.ok) {
      return NextResponse.json(
        { error: 'El artículo no existe' },
        { status: 404 }
      );
    }

    const fileData = await getResponse.json();

    // Eliminar archivo en GitHub
    const deleteResponse = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/articles/${slug}.mdx`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Delete article: ${slug}`,
          sha: fileData.sha,
          branch: process.env.GITHUB_BRANCH || 'main',
        }),
      }
    );

    if (!deleteResponse.ok) {
      throw new Error('Error al eliminar en GitHub');
    }

    return NextResponse.json({
      success: true,
      message: 'Artículo eliminado exitosamente. Vercel redesplegará automáticamente.',
    });
  } catch (error) {
    console.error('Error al eliminar el artículo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el artículo de GitHub' },
      { status: 500 }
    );
  }
}
