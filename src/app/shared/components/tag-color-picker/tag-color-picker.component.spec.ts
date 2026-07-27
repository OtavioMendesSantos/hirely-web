import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TagColorPickerComponent } from './tag-color-picker.component';

describe('TagColorPickerComponent', () => {
  let component: TagColorPickerComponent;
  let fixture: ComponentFixture<TagColorPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagColorPickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Hex validation', () => {
    it('should validate 6-character hex correctly', () => {
      expect(component.isValidHex('#FFFFFF')).toBe(true);
      expect(component.isValidHex('#000000')).toBe(true);
      expect(component.isValidHex('#dc2626')).toBe(true);
    });

    it('should validate 3-character hex correctly', () => {
      expect(component.isValidHex('#FFF')).toBe(true);
      expect(component.isValidHex('#000')).toBe(true);
      expect(component.isValidHex('#a3c')).toBe(true);
    });

    it('should invalidate incorrect hex formats', () => {
      expect(component.isValidHex('FFFFFF')).toBe(false); // missing hash
      expect(component.isValidHex('#FFFFF')).toBe(false); // 5 chars
      expect(component.isValidHex('#FFFFFFF')).toBe(false); // 7 chars
      expect(component.isValidHex('#GGGGGG')).toBe(false); // invalid characters
      expect(component.isValidHex('#12')).toBe(false); // too short
      expect(component.isValidHex('')).toBe(false); // empty
    });
  });

  describe('Custom Hex Input Handling', () => {
    it('should update current color and emit when valid hex is entered', () => {
      vi.spyOn(component.valueChange, 'emit');

      component.onCustomHexChange('#123456');

      expect(component.hexError()).toBe(false);
      expect(component.currentColor()).toBe('#123456');
      expect(component.valueChange.emit).toHaveBeenCalledWith('#123456');
    });

    it('should format 3-char hex to 6-char hex when valid hex is entered', () => {
      vi.spyOn(component.valueChange, 'emit');

      component.onCustomHexChange('#abc');

      expect(component.hexError()).toBe(false);
      expect(component.currentColor()).toBe('#AABBCC');
      expect(component.valueChange.emit).toHaveBeenCalledWith('#AABBCC');
    });

    it('should not update current color or emit when invalid hex is entered', () => {
      vi.spyOn(component.valueChange, 'emit');
      const initialColor = component.currentColor();

      component.onCustomHexChange('#123Z56');

      expect(component.hexError()).toBe(true);
      expect(component.currentColor()).toBe(initialColor);
      expect(component.valueChange.emit).not.toHaveBeenCalled();
    });
  });
});
