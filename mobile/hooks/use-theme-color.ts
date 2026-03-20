/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LIGHT_COLORS, DARK_COLORS } from '../src/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof LIGHT_COLORS & keyof typeof DARK_COLORS
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return theme === 'dark' ? DARK_COLORS[colorName] : LIGHT_COLORS[colorName];
  }
}
