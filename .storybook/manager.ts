import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

const theme = create({
  base: 'light',
  brandTitle: 'PORTFOLIO',
  brandImage: '/storybook/logo.png',
  brandUrl: '/',
  appBg: '#faf9f5', // --color-beige-50
  appContentBg: '#faf9f5',

  // colorPrimary: '#1e1b18', // --color-brown-900
  // colorSecondary: '#6685D8', // --color-orange
  //
  // fontBase: 'Montserrat, sans-serif',
});

addons.setConfig({ theme });
