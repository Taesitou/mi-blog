import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug es requerido' },
        { status: 400 }
      );
    }

    // Get file from GitHub
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/articles/${slug}.mdx`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3.raw',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Artículo no encontrado' },
        { status: 404 }
      );
    }

    const content = await response.text();

    // Parse frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return NextResponse.json(
        { error: 'Formato de archivo inválido' },
        { status: 400 }
      );
    }

    const frontmatter = match[1];
    const body = match[2];

    // Extract fields from frontmatter
    const titleMatch = frontmatter.match(/title:\s*"(.+)"/);
    const dateMatch = frontmatter.match(/publishedAt:\s*"(.+)"/);
    const categoryMatch = frontmatter.match(/category:\s*"(.+)"/);

    return NextResponse.json({
      title: titleMatch ? titleMatch[1] : '',
      date: dateMatch ? dateMatch[1] : '',
      category: categoryMatch ? categoryMatch[1] : '',
      content: body.trim(),
    });
  } catch (error) {
    console.error('Error al obtener el artículo:', error);
    return NextResponse.json(
      { error: 'Error al obtener el artículo' },
      { status: 500 }
    );
  }
}
