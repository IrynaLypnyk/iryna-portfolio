import { anchors } from '@/constants/routes';

export type Anchor = (typeof anchors)[keyof typeof anchors];
