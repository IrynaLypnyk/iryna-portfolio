import { motion } from 'framer-motion';
import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';
import { ProjectGalleryMeta } from '@/hooks/useProjectMeta';
import { ImagesGallery } from '@/app/(site)/[locale]/_components/_ui/ImagesGallery';

type Props = ProjectGalleryMeta & { galleryId: string; height?: number };

export function ProjectGallery({ gallery, galleryId, height }: Props) {
  return (
    <motion.div
      id={galleryId}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="border-app-line -pr-(--page-pad-right) overflow-visible border-t pt-7 [grid-area:gallery]"
    >
      <div className="grid gap-6 pb-4">
        <Label color="gray" variant={'compact'} size={'xs'}>
          {gallery?.label}
        </Label>
        <div key="gallery" className="grid gap-3">
          {gallery && (
            <ImagesGallery
              photos={gallery.value}
              imageHeightClass={height ? `h-${height}` : undefined}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
