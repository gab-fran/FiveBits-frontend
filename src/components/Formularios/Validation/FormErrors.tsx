import type { FieldError } from '../../../validation/inputs';
export function FieldErrors({
    errors,
    name,
}: {
    errors: FieldError[];
    name: string;
}) {
    const messages = errors.filter((error) => error.campo === name);
    return messages.length ? (
        <small
            id={`erro-${name}`}
            role="alert"
            style={{ color: '#b42318', display: 'block' }}
        >
            {messages.map((error) => error.mensagem).join(' ')}
        </small>
    ) : null;
}
