import type { InputHTMLAttributes } from 'react';
import { FieldErrors } from './FormErrors';
import type { FieldError } from '../../../validation/inputs';
import styles from '../../../styles/DetalhesPadrao.module.css';

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
        <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>
                <i className="pi pi-lock text-amber-500 text-sm"></i>
                Dados de acesso
            </h3>

            <div className={styles.sectionText}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="email">
                        E-mail
                    </label>
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
                        className={styles.fieldInput}
                        placeholder="Digite o e-mail"
                    />
                    <FieldErrors errors={errors} name="email" />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="senha">
                        Senha
                    </label>
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
                        className={styles.fieldInput}
                        placeholder="Digite a senha"
                    />
                    <FieldErrors errors={errors} name="senha" />
                </div>
            </div>
        </div>
    );
}
