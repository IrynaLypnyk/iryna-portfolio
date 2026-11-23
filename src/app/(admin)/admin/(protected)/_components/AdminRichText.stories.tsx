import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { AdminRichText } from './AdminRichText';
import { CaseBody } from '@/app/(site)/[locale]/_components/_ui/CaseBody';

function Example() {
  const [value, setValue] = useState(
    'Doctor and clinic search: Redesigned search interfaces.\n\nPatient dashboard: Improved medical records and appointment history.'
  );
  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-6">
      <AdminRichText value={value} onChangeAction={setValue} label="Body (EN)" />
      <button type="button" onClick={() => setValue('Original paragraph.\n\nSecond paragraph.')}>
        Reset content
      </button>
      <div>
        <h2 className="mb-4 font-semibold">Page preview</h2>
        <CaseBody body={value} />
      </div>
    </div>
  );
}
const meta = { title: 'Admin/RichText', component: Example } satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
