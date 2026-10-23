import type { InputHTMLAttributes } from 'react';
import { FieldErrors } from './FormErrors';
import type { FieldError } from '../../../validation/inputs';
export function AccountFields({
    value,
    onChange,
    errors,
    fieldProps,
}: {
    value: { email: string; senha: string };
    onChange: (value: { email: string; senha: string }) => void;
    errors: FieldError[];
    fieldProps: (name: string) => InputHTMLAttributes<HTMLInputElement>;
}) {
    return (
        <fieldset
            style={{ border: 0, padding: 0, display: 'grid', gap: '0.75rem' }}
        >
            <legend>Dados de acesso</legend>
            <label htmlFor="email">E-mail</label>
            <input
                {...fieldProps('email')}
                id="email"
                name="email"
                type="email"
                required
                maxLength={255}
                autoComplete="email"
                value={value.email}
                onChange={(event) =>
                    onChange({ ...value, email: event.target.value })
                }
                aria-invalid={errors.some((e) => e.campo === 'email')}
                aria-describedby="erro-email"
            />
            <FieldErrors errors={errors} name="email" />
            <label htmlFor="senha">Senha</label>
            <input
                {...fieldProps('senha')}
                id="senha"
                name="senha"
                type="password"
                required
                maxLength={128}
                autoComplete="new-password"
                value={value.senha}
                onChange={(event) =>
                    onChange({ ...value, senha: event.target.value })
                }
                aria-invalid={errors.some((e) => e.campo === 'senha')}
                aria-describedby="erro-senha"
            />
            <FieldErrors errors={errors} name="senha" />
        </fieldset>
    );
}
