import { ThemeMode } from '../services/theme';

export interface UserPreferences {
  theme: ThemeMode;
  confetti_enabled: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  confetti_enabled: true,
};
