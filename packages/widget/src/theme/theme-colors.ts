export const themeColors = {
  primary: {
    main: {
      default: '#63B3ED',
      _dark: '#03FEFF'
    },
    hover: {
      default: '#90CDF4',
      _dark: '#02E1E1'
    },
    500: { default: '#3182CE', _dark: '#03FEFF' },
    alpha4: { default: 'rgba(255, 255, 255, 0.04)' },
    alpha8: { default: 'rgba(255, 255, 255, 0.08)' },
    alpha12: { default: 'rgba(255, 255, 255, 0.12)' },
    alpha20: { default: 'rgba(255, 255, 255, 0.20)' },
    alpha26: { default: 'rgba(255, 255, 255, 0.26)' },
    alpha32: { default: 'rgba(255, 255, 255, 0.32)' },
    alpha40: { default: 'rgba(255, 255, 255, 0.40)' },
    alpha60: { default: 'rgba(255, 255, 255, 0.60)' },
    alpha72: { default: 'rgba(255, 255, 255, 0.72)' }
  },
  secondary: {
    main: { default: '#FFFFFF', _dark: '#FFFFFF' },
    alpha0: { default: 'rgba(0, 0, 0, 0)', _dark: 'rgba(255, 255, 255, 0)' },
    alpha4: {
      default: 'rgba(0, 0, 0, 0.04)',
      _dark: 'rgba(255, 255, 255, 0.04)'
    },
    alpha8: {
      default: 'rgba(0, 0, 0, 0.08)',
      _dark: 'rgba(255, 255, 255, 0.08)'
    },
    alpha12: {
      default: 'rgba(0, 0, 0, 0.12)',
      _dark: 'rgba(255, 255, 255, 0.12)'
    },
    alpha16: {
      default: 'rgba(0, 0, 0, 0.16)',
      _dark: 'rgba(255, 255, 255, 0.16)'
    },
    alpha20: {
      default: 'rgba(0, 0, 0, 0.20)',
      _dark: 'rgba(255, 255, 255, 0.20)'
    },
    alpha24: {
      default: 'rgba(0, 0, 0, 0.24)',
      _dark: 'rgba(255, 255, 255, 0.24)'
    },
    alpha32: {
      default: 'rgba(0, 0, 0, 0.32)',
      _dark: 'rgba(255, 255, 255, 0.32)'
    },
    alpha40: {
      default: 'rgba(0, 0, 0, 0.40)',
      _dark: 'rgba(255, 255, 255, 0.40)'
    },
    alpha60: {
      default: 'rgba(0, 0, 0, 0.60)',
      _dark: 'rgba(255, 255, 255, 0.60)'
    },
    alpha72: {
      default: 'rgba(0, 0, 0, 0.72)',
      _dark: 'rgba(255, 255, 255, 0.72)'
    }
  },
  success: {
    500: { default: '#05D7B7', _dark: '#05D7B7' }
  },
  error: {
    500: { default: '#fd4084', _dark: '#fd4084' }
  },
  gradients: {
    primary: {
      default:
        'linear-gradient(0deg, #03FEFF 0%, rgba(99, 179, 237, 0.04) 100%)'
    },
    secondary: {
      default:
        'linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0.08) 100%)'
    }
  },
  bg: {
    main: { default: '#FFFFFF', _dark: '#181818' },
    modal: {
      default: 'rgba(255, 255, 255, 0.40)',
      _dark: 'rgba(24, 24, 24, 0.40)'
    }
  },
  text: {
    primary: { default: '#03FEFF', _dark: '#03FEFF' },
    secondary: {
      default: 'rgba(255, 255, 255, 0.60)',
      _dark: 'rgba(255, 255, 255, 0.60)'
    },
    white: { default: '#FFFFFF', _dark: '#FFFFFF' },
    white60: {
      default: 'rgba(255, 255, 255, 0.60)',
      _dark: 'rgba(255, 255, 255, 0.60)'
    },
    black: { default: '#010302', _dark: '#010302' },
    disabled: {
      default: 'rgba(0, 0, 0, 0.16)',
      _dark: 'rgba(255, 255, 255, 0.72)'
    }
  },
  misc: {
    red: { default: '#fd4084' },
    yellow: { default: '#ffdb42' },
    green: { default: '#05d7b7' },
    greenGradient: {
      default: 'linear-gradient(to bottom, #05d7b7 0%, #a7ffc5)'
    }
  }
};

export type ThemeColorsType = typeof themeColors;
