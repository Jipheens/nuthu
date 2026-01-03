import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
  colors: {
    primary: '#ff6f61',
    secondary: '#6b5b95',
    accent: '#88b04b',
    background: '#f5f5f5',
    text: '#333333',
    border: '#dddddd',
  },
  fonts: {
    main: 'Arial, sans-serif',
    heading: 'Georgia, serif',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
};

export default theme;