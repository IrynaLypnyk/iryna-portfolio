import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { getImageKit } from '@/lib/imagekit/client';
import { getImageKitFolder } from '@/lib/imagekit/getImageKitFolder';
import { prisma } from '@/lib/prisma';

type Params = {
  params: Promise<{ id: string }>;
};

export function createMediaUploadAuthHandler(ownerType: 'projects' | 'experiments') {
  return async function GET(_request: Request, { params }: Params) {
    try {
      await requireAuth();
    } catch {
      return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
    }

    const { id } = await params;

    const query = { where: { id }, select: { slug: true } };
    const record =
      ownerType === 'projects'
        ? await prisma.project.findUnique(query)
        : await prisma.experiment.findUnique(query);

    if (!record) {
      return NextResponse.json({ message: 'Запис не знайдено' }, { status: 404 });
    }

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

    if (!publicKey) {
      console.error('IMAGEKIT_PUBLIC_KEY is not configured');

      return NextResponse.json({ message: 'ImageKit upload is not configured' }, { status: 500 });
    }

    const imageKit = getImageKit();

    const { token, expire, signature } = imageKit.helper.getAuthenticationParameters();

    const folder = getImageKitFolder(ownerType, record.slug, 'photos');

    return NextResponse.json(
      {
        token,
        expire,
        signature,
        publicKey,
        folder,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  };
}
