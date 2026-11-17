import type { Meta, StoryObj } from '@storybook/nextjs';
import { http, HttpResponse } from 'msw';
import { ProjectForm } from '../projects/_components/ProjectForm';
import { ExperimentForm } from '../experiments/_components/ExperimentForm';
import { UnsavedChangesProvider } from './UnsavedChangesProvider';
import {
  storyProject,
  storyExperiment,
  storyOwnerMedia,
  storySeparateCovers,
} from '@/storybook/admin-fixtures';
import { adminMediaHandlers } from '@/storybook/admin-media-mocks';
import { adminContentHandlers } from '@/storybook/admin-content-mocks';

function Forms({
  ownerType,
  create = false,
  separateCovers = false,
}: {
  ownerType: 'projects' | 'experiments';
  create?: boolean;
  separateCovers?: boolean;
}) {
  const initialMedia = separateCovers ? storySeparateCovers : storyOwnerMedia;
  return (
    <UnsavedChangesProvider>
      <header
        data-component="Header"
        className="sticky top-0 z-20 flex h-[65px] items-center border-b border-neutral-200 bg-white px-6 font-medium"
      >
        Admin
      </header>
      <main className="px-6 py-10">
        <div className="mx-auto max-w-5xl">
          {ownerType === 'projects' ? (
            create ? (
              <ProjectForm mode="create" />
            ) : (
              <ProjectForm mode="edit" project={storyProject} initialMedia={initialMedia} />
            )
          ) : create ? (
            <ExperimentForm mode="create" />
          ) : (
            <ExperimentForm mode="edit" experiment={storyExperiment} initialMedia={initialMedia} />
          )}
        </div>
      </main>
    </UnsavedChangesProvider>
  );
}
const meta = {
  title: 'Admin/ContentForms',
  component: Forms,
  args: { ownerType: 'projects', create: false, separateCovers: false },
  beforeEach({ msw }) {
    msw.use(...adminMediaHandlers, ...adminContentHandlers);
  },
} satisfies Meta<typeof Forms>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Project: Story = {};
export const Experiment: Story = { args: { ownerType: 'experiments' } };
export const NewProject: Story = { args: { create: true } };
export const NewExperiment: Story = { args: { ownerType: 'experiments', create: true } };
/** Open the Media tab to compare independent home-page and case-study covers. */
export const SeparateProjectCovers: Story = { args: { separateCovers: true } };
export const SeparateExperimentCovers: Story = {
  args: { ownerType: 'experiments', separateCovers: true },
};
export const SaveError: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.patch('/api/admin/:owner/:id', () =>
        HttpResponse.json({ message: 'Simulated save failure' }, { status: 500 })
      )
    );
  },
};
