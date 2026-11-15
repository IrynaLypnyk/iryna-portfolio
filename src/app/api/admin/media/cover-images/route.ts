import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getImageKitFolder } from '@/lib/imagekit/getImageKitFolder';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import { IMAGE_MIME_TYPES } from '@/lib/media/image-policy';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const ownerType = request.nextUrl.searchParams.get('ownerType');
  const ownerId = request.nextUrl.searchParams.get('ownerId');
  if ((ownerType !== 'projects' && ownerType !== 'experiments') || !ownerId) {
    return NextResponse.json({ message: 'Invalid owner' }, { status: 400 });
  }

  try {
    const query = { where: { id: ownerId }, select: { slug: true } };
    const owner =
      ownerType === 'projects'
        ? await prisma.project.findUnique(query)
        : await prisma.experiment.findUnique(query);
    if (!owner) return NextResponse.json({ message: 'Owner not found' }, { status: 404 });

    // Include uploads no longer used as covers, without attaching them to the
    // public gallery. Keep the same owner-folder boundary as the save handler.
    const folder = `${getImageKitFolder(ownerType, owner.slug, 'photos').replace(/\/+$/, '')}/`;
    const assets = await prisma.mediaAsset.findMany({
      where: {
        src: { startsWith: folder },
        mimeType: { in: IMAGE_MIME_TYPES },
        width: { gt: 0 },
        height: { gt: 0 },
      },
      select: { id: true, src: true, mimeType: true, width: true, height: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
    return NextResponse.json(
      {
        images: assets.map(({ src, ...asset }) => ({
          ...asset,
          imageUrl: getImageUrl(src),
          label: src.split('/').pop() || 'Uploaded image',
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Failed to load cover images', error);
    return NextResponse.json({ message: 'Unable to load images' }, { status: 500 });
  }
}
