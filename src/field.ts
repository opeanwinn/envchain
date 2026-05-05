import { ValidatorFn, ValidationError } from './validators';

export interface FieldOptions<T> {
  validator: ValidatorFn<T>;
  defaultValue?: string;
  description?: string;
  required?: boolean;
}

export class Field<T> {
  private _defaultValue?: string;
  private _description?: string;
  private _required: boolean;
  private _validator: ValidatorFn<T>;

  constructor(options: FieldOptions<T>) {
    this._validator = options.validator;
    this._defaultValue = options.defaultValue;
    this._description = options.description;
    this._required = options.required ?? true;
  }

  default(value: string): this {
    this._defaultValue = value;
    this._required = false;
    return this;
  }

  describe(description: string): this {
    this._description = description;
    return this;
  }

  optional(): this {
    this._required = false;
    return this;
  }

  parse(key: string, rawValue: string | undefined): T | undefined {
    const value = rawValue ?? this._defaultValue;

    if (value === undefined || value === '') {
      if (this._required) {
        throw new ValidationError(key, 'variable is required but not set');
      }
      return undefined;
    }

    try {
      return this._validator(value);
    } catch (err) {
      throw new ValidationError(key, (err as Error).message);
    }
  }

  get description(): string | undefined {
    return this._description;
  }

  get isRequired(): boolean {
    return this._required;
  }
}

export function field<T>(validator: ValidatorFn<T>, options?: Partial<FieldOptions<T>>): Field<T> {
  return new Field<T>({ validator, ...options });
}
