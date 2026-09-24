import type { Meta, StoryObj } from '@storybook/nextjs';
import { ContactForm } from './ContactForm';
import { delay, http, HttpResponse } from 'msw';
import { apiRoutes } from '@/constants/routes';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Layouts/ContactForm',
  component: ContactForm,
} satisfies Meta<typeof ContactForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const fillAndSubmitForm = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);

  await userEvent.type(canvas.getByLabelText(/name/i), 'Iryna');
  await userEvent.type(canvas.getByLabelText(/email/i), 'iryna@example.com');
  await userEvent.type(canvas.getByLabelText(/message/i), 'Hello, this is a test message.');

  await userEvent.click(canvas.getByRole('button', { name: /send/i }));

  return canvas;
};

export const Success: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.post(apiRoutes.contact, () => {
        return HttpResponse.json({ success: true }, { status: 200 });
      })
    );
  },
  play: async ({ canvasElement }) => {
    await fillAndSubmitForm(canvasElement);

    await expect(canvasElement.querySelector('[data-status="success"]')).toBeInTheDocument();
  },
};

export const Error: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.post(apiRoutes.contact, () => {
        return HttpResponse.json({ error: 'Something went wrong' }, { status: 500 });
      })
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = await fillAndSubmitForm(canvasElement);

    await expect(canvas.getByText(/error/i)).toBeInTheDocument();
  },
};

export const Sending: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.post(apiRoutes.contact, async () => {
        await delay('infinite');

        return HttpResponse.json({ success: true });
      })
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = await fillAndSubmitForm(canvasElement);

    await expect(canvas.getByText(/sending/i)).toBeInTheDocument();
  },
};
