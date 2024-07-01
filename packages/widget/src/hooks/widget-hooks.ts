import { useState } from 'react';

export type WidgetPagesType = 'home' | 'tokens' | 'wallets' | 'networks';
export type DefaultWidgetOptionsType = {
  currentPage: WidgetPagesType;
};
export const defaultWidgetOptions: DefaultWidgetOptionsType = {
  currentPage: 'home'
};
export const useWidget = () => {
  const [widgetOptions, setWidgetOptions] = useState(defaultWidgetOptions);

  return {
    widgetOptions,
    setWidgetOptions
  };
};
