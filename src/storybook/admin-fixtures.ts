import type { ProjectWithSections } from '@/app/(admin)/admin/(protected)/projects/_components/ProjectForm';
import type { Experiment } from '@/generated/prisma/browser';
import type { OwnerMediaDraft } from '@/lib/media/owner-media-draft';
import { newMediaDraft } from '@/lib/media/media-draft';

const now = new Date('2026-10-16T12:00:00Z');
export const storyProject: ProjectWithSections = {
  id: 'story-owner',
  slug: 'story-project',
  titleEn: 'Project title',
  titleUk: 'Назва',
  status: 'COMPLETED',
  shortLabel: null,
  subtitleEn: null,
  subtitleUk: null,
  contextEn: null,
  contextUk: null,
  leadEn: null,
  leadUk: null,
  roleEn: null,
  roleUk: null,
  projectTypeEn: null,
  projectTypeUk: null,
  statusEn: null,
  statusUk: null,
  yearLabel: null,
  externalUrl: null,
  linkLabelEn: null,
  linkLabelUk: null,
  linkNoteEn: null,
  linkNoteUk: null,
  featuresTitleEn: null,
  featuresTitleUk: null,
  githubUrl: null,
  storybookUrl: null,
  stack: [],
  featuresEn: [],
  featuresUk: [],
  order: 0,
  published: true,
  featured: false,
  detailPageStatus: 'NONE',
  useSameCover: true,
  detailCoverAssetId: null,
  detailCoverAssetUkId: null,
  coverAssetId: 'existing-cover',
  coverAssetUkId: 'existing-uk',
  createdAt: now,
  updatedAt: now,
  sections: [
    {
      id: 'legacy-section',
      projectId: 'story-owner',
      order: 1,
      titleEn: 'Legacy',
      titleUk: 'Стара секція',
      bodyEn: 'Keep legacy content',
      bodyUk: 'Зберегти',
      body2En: null,
      body2Uk: null,
      createdAt: now,
      updatedAt: now,
    },
  ],
};
export const storyExperiment: Experiment = {
  id: 'story-owner',
  slug: 'story-experiment',
  titleEn: 'Experiment title',
  titleUk: 'Назва',
  descriptionEn: 'Description',
  descriptionUk: 'Опис',
  shortDescriptionEn: '',
  shortDescriptionUk: '',
  stack: null,
  demoUrl: null,
  githubUrl: null,
  order: 0,
  published: true,
  detailPageStatus: 'NONE',
  useSameCover: true,
  detailCoverAssetId: null,
  detailCoverAssetUkId: null,
  coverAssetId: 'existing-cover',
  coverAssetUkId: 'existing-uk',
  createdAt: now,
  updatedAt: now,
};
export const storyOwnerMedia: OwnerMediaDraft = {
  additionalMedia: [],
  contentBlocks: [],
  coverAsset: {
    id: 'existing-cover',
    imageUrl: '/storybook/pattern-photo.png',
    mimeType: 'image/png',
    width: 1280,
    height: 720,
  },
  coverAssetUk: {
    id: 'existing-uk',
    imageUrl: '/storybook/pattern-photo.png',
    mimeType: 'image/png',
    width: 1280,
    height: 720,
  },
};

export const storyMediaItems = [
  {
    ...newMediaDraft(storyOwnerMedia.coverAsset!, 'image'),
    id: 'photo-image',
    captionEn: 'Photo example',
  },
  {
    ...newMediaDraft(
      {
        id: 'video',
        imageUrl: '/storybook/pattern-video.webm',
        mimeType: 'video/webm',
        width: 1280,
        height: 720,
      },
      'video'
    ),
    id: 'photo-video',
    captionEn: 'Video example',
  },
];

export const storySeparateCovers: OwnerMediaDraft = {
  ...storyOwnerMedia,
  useSameCover: false,
  detailCoverAsset: storyOwnerMedia.coverAsset,
  detailCoverAssetUk: storyOwnerMedia.coverAssetUk,
};
