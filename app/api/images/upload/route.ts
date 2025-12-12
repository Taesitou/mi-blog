import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ninguna imagen' },
        { status: 400 }
      );
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }

    // Leer el archivo como buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear nombre de archivo único con timestamp
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Subir a GitHub
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/public/images/${fileName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload image: ${fileName}`,
          content: buffer.toString('base64'),
          branch: process.env.GITHUB_BRANCH || 'master',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('GitHub error:', error);
      throw new Error(error.message);
    }

    const data = await response.json();

    // URL relativa de la imagen
    const imageUrl = `/images/${fileName}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName,
      message: 'Imagen subida exitosamente',
      data,
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return NextResponse.json(
      { error: 'Error al subir la imagen a GitHub' },
      { status: 500 }
    );
  }
}
