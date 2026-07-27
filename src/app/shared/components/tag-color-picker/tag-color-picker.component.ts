import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const PRESETS = [
  '#EF4444', // Red
  '#F87171', // Light Red
  '#F59E0B', // Orange
  '#D97706', // Dark Orange
  '#10B981', // Emerald
  '#34D399', // Light Emerald
  '#3B82F6', // Blue
  '#60A5FA', // Light Blue
  '#8B5CF6', // Violet
  '#A78BFA', // Light Violet
  '#EC4899', // Pink
  '#F472B6', // Light Pink
  '#4B5563', // Gray
  '#6B7280', // Light Gray
  '#06B6D4', // Cyan
  '#EAB308', // Yellow
] as const;

@Component({
  selector: 'app-tag-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-color-picker.component.html',
})
export class TagColorPickerComponent {
  @Input() set value(val: string) {
    if (this.isValidHex(val)) {
      this.currentColor.set(val);
      this.customHex.set(val);
    }
  }
  @Output() valueChange = new EventEmitter<string>();

  presets = PRESETS;
  currentColor = signal<string>('#EF4444');
  customHex = signal<string>('#EF4444');
  hexError = signal<boolean>(false);

  selectPreset(color: string) {
    this.currentColor.set(color);
    this.customHex.set(color);
    this.hexError.set(false);
    this.valueChange.emit(color);
  }

  onCustomHexChange(newHex: string) {
    this.customHex.set(newHex);
    if (this.isValidHex(newHex)) {
      this.hexError.set(false);

      const formatted = this.formatHex(newHex);
      this.currentColor.set(formatted);
      this.valueChange.emit(formatted);
    } else {
      this.hexError.set(true);
    }
  }

  isValidHex(hex: string): boolean {
    const regex = /^#([0-9A-Fa-f]{3}){1,2}$/i;
    return regex.test(hex);
  }

  private formatHex(hex: string): string {
    if (hex.length === 4) {
      return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex.toUpperCase();
  }
}
