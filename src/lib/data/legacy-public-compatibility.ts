// Approved production snapshot compatibility. Match usage IDs, never asset IDs:
// another usage of the same cover asset remains independently displayable.
export const legacyProjectCoverPhotoIds = [
  'cmuuc580y000304kw3l6cnhej',
  'cmuucfpu6000104lbhivb3bgm',
  'cmuugtxno000d04l9cvh2tn44',
  'cmuyqt68z000206l58s7fgqk5',
  'cmv1jiz4q000106l6sx7mfk4p',
];
export const legacyExperimentCoverPhotoId = 'cmv50eppc000306jnxn4mu52b';
export const legacyProjectIds = new Set([
  'cmussqraf000004jz5yxdfi13',
  'cmutrav9s000204jteyj7x6ii',
  'cmuufi1fw000004l3k5m91y2z',
  'cmuyqstkm000006l5puajofg3',
  'cmuys7u74000006kza2hnjps8',
  'cmv1jieiw000006l3fh4r785d',
  'cmv2xpead000006l8ub5hiemz',
  'cmv2y7308000006l0nylk7dk3',
  'cmv2z9urd000006l3m2g8rr9g',
]);

export function visibleAdditionalUsage(photo: { id: string; isProjectCover: boolean }) {
  return (
    photo.id !== legacyExperimentCoverPhotoId &&
    (!photo.isProjectCover || legacyProjectCoverPhotoIds.includes(photo.id))
  );
}
