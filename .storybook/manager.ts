import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

const theme = create({
  base: 'light',
  colorSecondary: '#84aaff',
});

addons.setConfig({ theme });
