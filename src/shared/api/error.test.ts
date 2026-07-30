import { describe, expect, it } from 'vitest';
import { ApiError, isProblemDetail, isValidationProblem } from './error';
import type { ValidationProblem } from './types';

describe('ApiError', () => {
  it('exposes validation errors for a 422 validation problem', () => {
    const body: ValidationProblem = {
      code: 'validation_failed',
      title: 'Ошибка валидации',
      message: 'Запрос содержит некорректные поля.',
      errors: [
        { field: 'price', message: 'Значение должно быть больше 0', code: 'positive' },
      ],
    };
    const error = new ApiError(422, body);
    expect(error.isValidationError).toBe(true);
    expect(error.validation?.errors[0]?.field).toBe('price');
    expect(error.displayMessage).toBe('Запрос содержит некорректные поля.');
  });

  it('is not a validation error for a plain problem detail', () => {
    const error = new ApiError(404, {
      code: 'resource_not_found',
      title: 'Не найдено',
      message: 'Аукцион не найден',
    });
    expect(error.isValidationError).toBe(false);
    expect(error.validation).toBeNull();
    expect(error.displayMessage).toBe('Аукцион не найден');
  });
});

describe('problem guards', () => {
  it('detects problem details and validation problems', () => {
    expect(isProblemDetail({ code: 'x', title: 't', message: 'm' })).toBe(true);
    expect(isProblemDetail({})).toBe(false);
    expect(
      isValidationProblem({
        code: 'validation_failed',
        title: 't',
        message: 'm',
        errors: [],
      }),
    ).toBe(true);
    expect(isValidationProblem({ code: 'other', message: 'm', title: 't' })).toBe(false);
  });
});
