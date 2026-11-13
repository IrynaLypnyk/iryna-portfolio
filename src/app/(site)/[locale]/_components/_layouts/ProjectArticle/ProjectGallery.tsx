import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';
import { ProjectGalleryMeta } from '@/hooks/useProjectMeta';
import { ImagesGallery } from '@/app/(site)/[locale]/_components/_ui/ImagesGallery';

type Props = ProjectGalleryMeta;

export function ProjectGallery({ gallery }: Props) {
  return (
    <div className="-pr-(--page-pad-right) pt-7">
      <div className="grid gap-6 pb-4">
        <Label color="gray" variant={'compact'} size={'xs'}>
          {gallery?.label}
        </Label>
        <div key="gallery" className="grid gap-3">
          {gallery && <ImagesGallery photos={gallery.value} />}
        </div>
      </div>
    </div>
  );
}
