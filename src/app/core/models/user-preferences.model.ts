import { ThemeMode } from '../services/theme';

export type AutoArchiveDays = 0 | 30 | 60 | 90;

export interface UserPreferences {
  auto_archive_days: AutoArchiveDays;
  theme: ThemeMode;
  confetti_enabled: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  auto_archive_days: 60,
  confetti_enabled: true,
};
