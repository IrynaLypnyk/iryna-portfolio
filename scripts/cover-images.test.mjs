import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server.js';
import { loadTypeScript } from './helpers/load-typescript.mjs';

function setup({ authorized = true, owner = { slug: 'portfolio' } } = {}) {
  const queries = [];
  const owners = [];
  const { GET } = loadTypeScript('src/app/api/admin/media/cover-images/route.ts', {
    '@/lib/auth': {
      requireAuth: async () => {
        if (!authorized) throw new Error('Unauthorized');
      },
    },
    '@/lib/prisma': {
      prisma: {
        project: {
          findUnique: async () => {
            owners.push('projects');
            return owner;
          },
        },
        experiment: {
          findUnique: async () => {
            owners.push('experiments');
            return owner;
          },
        },
        mediaAsset: {
          findMany: async (query) => {
            queries.push(query);
            return [
              {
                id: 'retired-cover',
                src: '/root/projects/portfolio/photos/old.png',
                mimeType: 'image/png',
                width: 1200,
                height: 800,
              },
            ];
          },
        },
      },
    },
    '@/lib/imagekit/getImageKitFolder': {
      getImageKitFolder: (...parts) => `/root/${parts.join('/')}`,
    },
    '@/lib/imagekit/get-image-url': { getImageUrl: (src) => `https://images.example${src}` },
  });
  return {
    queries,
    owners,
    get: (query = 'ownerType=projects&ownerId=owner') =>
      GET(new NextRequest(`http://localhost/api/admin/media/cover-images?${query}`)),
  };
}

test('cover library rejects unauthenticated requests before reading data', async () => {
  const fixture = setup({ authorized: false });
  assert.equal((await fixture.get()).status, 401);
  assert.equal(fixture.owners.length, 0);
  assert.equal(fixture.queries.length, 0);
});

test('cover library validates owner type and existence', async () => {
  const fixture = setup({ owner: null });
  assert.equal((await fixture.get('ownerType=other&ownerId=owner')).status, 400);
  assert.equal((await fixture.get('ownerType=projects')).status, 400);
  assert.equal((await fixture.get()).status, 404);
  assert.equal(fixture.queries.length, 0);
});

for (const ownerType of ['projects', 'experiments']) {
  test(`${ownerType} cover library includes retired uploads and scopes images to the exact owner folder`, async () => {
    const fixture = setup();
    const response = await fixture.get(`ownerType=${ownerType}&ownerId=owner`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const { images } = await response.json();
    assert.equal(images[0].id, 'retired-cover');
    assert.equal(images[0].label, 'old.png');
    assert.equal(
      images[0].imageUrl,
      'https://images.example/root/projects/portfolio/photos/old.png'
    );
    assert.deepEqual(fixture.owners, [ownerType]);
    const where = fixture.queries[0].where;
    assert.equal(where.src.startsWith, `/root/${ownerType}/portfolio/photos/`);
    assert.ok(where.mimeType.in.includes('image/png'));
    assert.ok(where.mimeType.in.every((mime) => mime.startsWith('image/')));
    assert.equal(where.width.gt, 0);
    assert.equal(where.height.gt, 0);
    // No usage filter: unassigned former covers must remain selectable.
    assert.equal(where.projectCovers, undefined);
  });
}
