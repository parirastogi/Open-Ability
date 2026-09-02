import { AccessibilityProfile } from '@/types';

export interface AccessibilityService {
  applyProfile(profile: Partial<AccessibilityProfile>): void;
  getAccommodationsList(): string[];
}

export class ClientAccessibilityService implements AccessibilityService {
  applyProfile(profile: Partial<AccessibilityProfile>): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // High Contrast Mode
    if (profile.highContrastRequired) {
      root.classList.add('dark-contrast');
      root.classList.remove('dark'); // override standard dark mode
    } else {
      root.classList.remove('dark-contrast');
    }

    // Large Text Mode
    if (profile.largeTextRequired) {
      root.classList.add('accessibility-large-text');
    } else {
      root.classList.remove('accessibility-large-text');
    }

    // Keyboard Navigation Indicator Helper
    if (profile.keyboardNavigationOnly) {
      root.classList.add('keyboard-nav-only');
    } else {
      root.classList.remove('keyboard-nav-only');
    }
  }

  getAccommodationsList(): string[] {
    return [
      'Screen Reader Compatible Layout',
      'High-Contrast CSS Themes',
      'Text-to-Speech (Audio Captions)',
      'Speech-to-Text (Voice Input)',
      'Keyboard-Only Shortcuts and Focus States',
      'Caption and Transcript Accommodations',
      'Extra Time and Dynamic Pacing',
      'Sign-Language Avatar Guidance',
      'Physical Access Workspace Matching',
      'Flexible Working Schedule Adjustments'
    ];
  }
}

export const accessibilityService = new ClientAccessibilityService();
