import { FieldErrors } from '../Validation/FormErrors';
import { useFormErrors } from '../Validation/useFormErrors';
import { parseLogin } from '../../../validation/inputs';
import { AlertCard } from '../../AlertCard';
import { type JSX, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthRequests from '../../../fetch/AuthRequests';
import styles from './FormLogin.module.css';

function LoginForm(): JSX.Element {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const validation = useFormErrors();
    const validarFormulario = () => parseLogin({ email, senha });

    interface LoginData {
        email: string;
        senha: string;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (salvando) return;
        validation.clear();
        setErro('');
        const login: LoginData = { email, senha };

        try {
            validarFormulario();
            setSalvando(true);
            if (await AuthRequests.login(login)) {
                window.location.href = '/bem-vindo';
            }
        } catch (error) {
            setErro(validation.capture(error));
        } finally {
            setSalvando(false);
        }
    };

    return (
        <main className={styles.loginStage}>
            <section className={styles.loginCard} aria-labelledby="login-title">
                <div className={styles.brand} aria-label="MedFlow">
                    <span>Med</span>
                    <strong>Flow</strong>
                </div>

                <h1 id="login-title">Acesse sua conta</h1>
                <p className={styles.subtitle}>
                    Bem-vindo de volta! Acesse sua conta.
                </p>

                {erro && <AlertCard variant="danger" message={erro} />}
                <form
                    onSubmit={handleSubmit}
                    className={styles.form}
                    noValidate
                >
                    <div className={styles.formGroup}>
                        <label htmlFor="login-email">E-mail</label>
                        <input
                            id="login-email"
                            name="email"
                            maxLength={255}
                            {...validation.field('email', validarFormulario)}
                            type="email"
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                        <FieldErrors errors={validation.errors} name="email" />
                    </div>

                    <div className={styles.formGroup}>
                        <div className={styles.passwordLabel}>
                            <label htmlFor="login-password">Senha</label>
                            <span>
                                Para recuperar o acesso, entre em contato com a
                                clínica.
                            </span>
                        </div>
                        <input
                            id="login-password"
                            name="senha"
                            maxLength={128}
                            {...validation.field('senha', validarFormulario)}
                            type="password"
                            placeholder="Sua senha segura"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                        <FieldErrors errors={validation.errors} name="senha" />
                    </div>

                    <button
                        type="submit"
                        disabled={salvando}
                        className={styles.loginButton}
                    >
                        Entrar na sua conta
                    </button>
                </form>

                <p className={styles.registerPrompt}>
                    Ainda não tem conta?{' '}
                    <Link to="/cadastro/paciente">Cadastre-se grátis</Link>
                </p>
            </section>
        </main>
    );
}

export default LoginForm;
