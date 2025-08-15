import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      '50': '{cyan.50}',
      '100': '{cyan.100}',
      '200': '{cyan.200}',
      '300': '{cyan.300}',
      '400': '{cyan.400}',
      '500': '{cyan.500}',
      '600': '{cyan.600}',
      '700': '{cyan.700}',
      '800': '{cyan.800}',
      '900': '{cyan.900}',
      '950': '{cyan.950}',
    },
    colorScheme: {
      light: {
        surface: {
          '50': '{slate.50}',
          '100': '{slate.100}',
          '200': '{slate.200}',
          '300': '{slate.300}',
          '400': '{slate.400}',
          '500': '{slate.500}',
          '600': '{slate.600}',
          '700': '{slate.700}',
          '800': '{slate.800}',
          '900': '{slate.900}',
          '950': '{slate.950}',
        },
      },
      dark: {
        surface: {
          '50': '{slate.50}',
          '100': '{slate.100}',
          '200': '{slate.200}',
          '300': '{slate.300}',
          '400': '{slate.400}',
          '500': '{slate.500}',
          '600': '{slate.600}',
          '700': '{slate.700}',
          '800': '{slate.800}',
          '900': '{slate.900}',
          '950': '{slate.950}',
        },
      },
    },
  },

});
