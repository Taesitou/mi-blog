import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const content = buffer.toString('utf-8');

    // Generar slug desde el nombre del archivo (sin extensión)
    const slug = fileName
      .replace(/\.(md|mdx)$/, '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Guardar en la carpeta articles
    const articlesPath = path.join(process.cwd(), 'articles');
    const filePath = path.join(articlesPath, `${slug}.mdx`);

    // Verificar si el archivo ya existe
    try {
      await fs.access(filePath);
      return NextResponse.json(
        { error: 'Ya existe un artículo con ese nombre' },
        { status: 409 }
      );
    } catch {
      // El archivo no existe, podemos crearlo
    }

    // Guardar el archivo
    await fs.writeFile(filePath, content, 'utf-8');

    return NextResponse.json({
      success: true,
      slug,
      message: 'Archivo subido exitosamente',
    });
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
