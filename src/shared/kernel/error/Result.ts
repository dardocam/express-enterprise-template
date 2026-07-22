export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _error: string;
  private readonly _value: T;

  private constructor(isSuccess: boolean, error: string, value: T) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;
    Object.freeze(this);
  }

  static ok<U>(value?: U): Result<U> {
    // Si no se pasa valor, se asigna undefined (sigue siendo un Result exitoso sin valor)
    return new Result<U>(true, '', value as U);
  }

  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error, null as unknown as U);
  }

  getValue(): T {
    if (this.isFailure) {
      throw new Error(`No se puede obtener el valor de un resultado fallido: ${this._error}`);
    }
    return this._value;
  }

  getErrorValue(): string {
    if (this.isSuccess) {
      throw new Error('No se puede obtener el error de un resultado exitoso');
    }
    return this._error;
  }
}