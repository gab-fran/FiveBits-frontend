import { useState } from 'react';
import { ApiError } from '../../../fetch/ApiClient';
import { ValidationError, type FieldError } from '../../../validation/inputs';

export function useFormErrors() {
    const [errors, setErrors] = useState<FieldError[]>([]);
    const clear = () => setErrors([]);
    const capture = (error: unknown) => {
        const details =
            error instanceof ValidationError || error instanceof ApiError
                ? error.erros
                : [];
        setErrors(details);
        if (details[0])
            requestAnimationFrame(() =>
                document
                    .querySelector<HTMLElement>(
                        `[name="${CSS.escape(details[0]!.campo)}"]`,
                    )
                    ?.focus(),
            );
        return error instanceof Error
            ? error.message
            : 'Não foi possível concluir a operação.';
    };
    const field = (name: string, validate?: () => unknown) => ({
        onBlur: () => {
            if (!validate) return;
            let details: FieldError[] = [];
            try {
                validate();
            } catch (error) {
                if (error instanceof ValidationError)
                    details = error.erros.filter((item) => item.campo === name);
            }
            setErrors((current) => [
                ...current.filter((item) => item.campo !== name),
                ...details,
            ]);
        },
        'aria-invalid': errors.some((error) => error.campo === name),
        'aria-describedby': errors.some((error) => error.campo === name)
            ? `erro-${name}`
            : undefined,
    });
    return { errors, clear, capture, field };
}
