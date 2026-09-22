// import type { Meta, StoryObj } from '@storybook/nextjs';
// import { useMemo } from 'react';
//
// type ColorToken = {
//   name: string;
//   value: string;
// };
//
// function Colors() {
//   const colors = useMemo<ColorToken[]>(() => {
//     if (typeof document === 'undefined') {
//       return [];
//     }
//
//     const styles = getComputedStyle(document.documentElement);
//
//     return Array.from(styles)
//       .filter((name) => name.startsWith('--color-'))
//       .map((name) => ({
//         name,
//         value: styles.getPropertyValue(name).trim(),
//       }))
//       .sort((a, b) => a.name.localeCompare(b.name));
//   }, []);
//
//   return (
//     <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
//       {colors.map(({ name, value }) => (
//         <div key={name}>
//           <div
//             className="aspect-video border border-black/10"
//             style={{ backgroundColor: `var(${name})` }}
//           />
//
//           <div className="mt-2 font-mono text-sm">{name.replace('--color-', '')}</div>
//
//           <div className="mt-1 font-mono text-xs opacity-60">{value}</div>
//         </div>
//       ))}
//     </div>
//   );
// }
//
// const meta = {
//   title: 'Design Tokens/Colors',
//   component: Colors,
//   parameters: {
//     layout: 'padded',
//   },
// } satisfies Meta<typeof Colors>;
//
// export default meta;
//
// type Story = StoryObj<typeof meta>;
//
// export const Palette: Story = {};
import type { Meta, StoryObj } from '@storybook/nextjs';

type ColorToken = {
  name: string;
  value: string;
};

function getColorTokens(): ColorToken[] {
  if (typeof document === 'undefined') {
    return [];
  }

  const styles = getComputedStyle(document.documentElement);

  return Array.from(styles)
    .filter((name) => name.startsWith('--color-app'))
    .map((name) => ({
      name,
      value: styles.getPropertyValue(name).trim(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function Colors() {
  const colors = getColorTokens();

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
      {colors.map(({ name, value }) => (
        <div key={name}>
          <div
            className="aspect-video border border-black/10"
            style={{
              backgroundColor: `var(${name})`,
            }}
          />

          <div className="mt-2 font-mono text-sm">{name.replace('--color-app-', '')}</div>

          <div className="mt-1 font-mono text-xs opacity-60">{value}</div>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: 'Design Tokens/Colors',
  component: Colors,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Colors>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Palette: Story = {};
