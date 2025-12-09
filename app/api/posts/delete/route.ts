import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Se requiere el slug del artículo' },
        { status: 400 }
      );
    }

    // Buscar el archivo .mdx
    const articlesPath = path.join(process.cwd(), 'articles');
    const filePath = path.join(articlesPath, `${slug}.mdx`);

    // Verificar si el archivo existe
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'El artículo no existe' },
        { status: 404 }
      );
    }

    // Eliminar el archivo
    await fs.unlink(filePath);

    return NextResponse.json({
      success: true,
      message: 'Artículo eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar el artículo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el artículo' },
      { status: 500 }
    );
  }
}
