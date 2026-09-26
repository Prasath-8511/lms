export type ResourceFieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox';

export interface ResourceFieldOption {
  label: string;
  value: string;
}

export interface ResourceField {
  key: string;
  label: string;
  type: ResourceFieldType;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: ResourceFieldOption[];
  rows?: number;
  hint?: string;
}

export interface ResourceFormValue {
  [key: string]: string | number | boolean;
}
