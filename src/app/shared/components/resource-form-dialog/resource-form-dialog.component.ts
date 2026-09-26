import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon';
import { ResourceField, ResourceFormValue } from '../../models/resource-form.models';

@Component({
  selector: 'app-resource-form-dialog',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './resource-form-dialog.component.html',
  styleUrl: './resource-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceFormDialogComponent {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input('');
  readonly fields = input.required<ResourceField[]>();
  readonly initialValue = input<ResourceFormValue>({});
  readonly submitLabel = input('Save');
  readonly deleteLabel = input<string>();
  readonly submitting = input(false);
  readonly errorMessage = input('');
  readonly value = output<ResourceFormValue>();
  readonly invalid = output<string>();
  readonly cancelled = output<void>();
  readonly deleted = output<void>();
  protected formValue: ResourceFormValue = {};

  private readonly resetForm = effect(() => {
    if (this.open()) {
      this.formValue = { ...this.initialValue() };
    }
  });

  protected fieldValue(field: ResourceField): string | number | boolean {
    return this.formValue[field.key] ?? this.initialValue()[field.key] ?? (field.type === 'checkbox' ? false : '');
  }

  protected setValue(field: ResourceField, value: string | number | boolean): void {
    this.formValue = { ...this.formValue, [field.key]: value };
  }

  protected submit(): void {
    if (this.submitting()) {
      return;
    }
    const nextValue = { ...this.initialValue(), ...this.formValue };
    for (const field of this.fields()) {
      const value = nextValue[field.key];
      if (field.required && (value === '' || value === undefined || value === null)) {
        this.invalid.emit(`${field.label} is required.`);
        return;
      }
      if (field.type === 'number' && value !== '' && Number.isNaN(Number(value))) {
        this.invalid.emit(`${field.label} must be a valid number.`);
        return;
      }
      if (field.type === 'email' && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        this.invalid.emit(`${field.label} must be a valid email address.`);
        return;
      }
    }
    this.value.emit(nextValue);
  }
}
