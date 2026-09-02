import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-markdown-input',
  standalone: true,
  imports: [FormsModule, HlmFieldImports, HlmInputImports, HlmTextarea, HlmTabsImports, MarkdownComponent],
  templateUrl: './markdown-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownInputComponent),
      multi: true,
    },
  ],
  host: {
    class: 'block w-full'
  }
})
export class MarkdownInputComponent implements ControlValueAccessor {
  public readonly id = input.required<string>();
  public readonly label = input.required<string>();
  public readonly placeholder = input<string>('Markdown supported');
  public readonly rows = input<number>(3);
  public readonly minHeight = input<number>(80);

  public readonly tab = signal<string>('write');
  public readonly value = signal<string>('');
  public readonly disabled = signal<boolean>(false);

  // ControlValueAccessor hooks
  public onChange = (value: string) => {};
  public onTouched = () => {};

  public writeValue(value: string | null): void {
    this.value.set(value || '');
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  public onInputChange(newValue: string): void {
    this.value.set(newValue);
    this.onChange(newValue);
  }
}
