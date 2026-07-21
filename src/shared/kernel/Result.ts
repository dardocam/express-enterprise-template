export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  private error: string | null;
  private _value: T | null;

  private constructor(isSuccess: boolean, error?: string | null, value?: T) {
    if (isSuccess && error) throw new Error('A result cannot be successful and contain an error');
    if (!isSuccess && !error) throw new Error('A failing result needs to contain an error message');

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error || null;
    this._value = value || null;
  }

  public getValue(): T {
    if (!this.isSuccess) throw new Error('Cannot get the value of a failed result.');
    return this._value as T;
  }

  public getErrorValue(): string {
    if (this.isSuccess) throw new Error('Cannot get the error of a successful result.');
    return this.error as string;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }
}
