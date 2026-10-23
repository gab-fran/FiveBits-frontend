import { parsePaciente } from '../../../validation/inputs';
import { FieldErrors } from '../Validation/FormErrors';
import { useFormErrors } from '../Validation/useFormErrors';
import { AccountFields } from '../Validation/AccountFields';
import { useState, type JSX } from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { useNavigate } from 'react-router-dom';
import PacienteRequest from '../../../fetch/PacienteRequest';
import type { PacienteDTO } from '../../../dto/PacienteDTO';
import Utilitario from '../../../utils/Utilitario';
import { AlertCard, type AlertVariant } from '../../AlertCard';
import styles from '../../../styles/DetalhesPadrao.module.css';

interface AlertaState {
    variant: AlertVariant;
    title?: string;
    message: string;
    type?: 'banner' | 'toast';
}

function FormPaciente(): JSX.Element {
    const navigate = useNavigate();
    const validation = useFormErrors();
    const [credenciais, setCredenciais] = useState({ email: '', senha: '' });
    const [formData, setFormData] = useState<PacienteDTO>({
        nome: '',
        cpf: '',
        telefone: '',
        dataNascimento: '',
    });
    const [salvando, setSalvando] = useState(false);
    const [alerta, setAlerta] = useState<AlertaState | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'cpf') {
            setFormData((prev) => ({
                ...prev,
                [name]: Utilitario.formatarCpf(value),
            }));
            return;
        }

        if (name === 'telefone') {
            const telefoneFormatado = Utilitario.formatarTelefone(value);
            setFormData((prev) => ({ ...prev, [name]: telefoneFormatado }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validarFormulario = () =>
        parsePaciente({ ...formData, ...credenciais }, true);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (salvando) return;
        validation.clear();
        setAlerta(null);
        try {
            const { account, ...paciente } = validarFormulario();
            setSalvando(true);
            await PacienteRequest.enviarFormularioPaciente({
                ...paciente,
                ...account!,
            });
            const admin = localStorage.getItem('role') === 'ADMIN';
            navigate(admin ? '/lista/paciente' : '/login', {
                state: {
                    alerta: {
                        variant: 'success',
                        message:
                            'Cadastro realizado com sucesso! Faça login para continuar.',
                        type: 'toast',
                    },
                },
            });
        } catch (error) {
            setAlerta({
                variant: 'danger',
                title: 'Verifique os dados',
                message: validation.capture(error),
            });
        } finally {
            setSalvando(false);
        }
    };

    return (
        <main
            className={`${styles.detailsWrapper} ${styles.centeredFormWrapper}`}
        >
            {alerta && (
                <AlertCard
                    variant={alerta.variant}
                    type={alerta.type || 'toast'}
                    title={alerta.title}
                    message={alerta.message}
                    onClose={() => setAlerta(null)}
                />
            )}
            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.cardContainer}>
                    <Card className={styles.detailsCard}>
                        <div className={styles.cardContent}>
                            {/* Cabeçalho */}
                            <div className={styles.detailsHeader}>
                                <h2 className={styles.headerTitle}>
                                    Cadastro de Paciente
                                </h2>
                                <div className={styles.headerSubtitle}>
                                    <span>
                                        Preencha os dados abaixo para registrar
                                        um novo paciente.
                                    </span>
                                </div>
                            </div>

                            <Divider className="my-3" />

                            {/* Grid */}
                            <div
                                className={`${styles.infoGrid} ${styles.singleColumnGrid}`}
                            >
                                <div className={styles.infoSection}>
                                    <h3 className={styles.sectionTitle}>
                                        <i className="pi pi-user text-green-500 text-sm"></i>{' '}
                                        Informações Pessoais
                                    </h3>

                                    <div className={styles.sectionText}>
                                        <div className={styles.fieldGroup}>
                                            <label
                                                className={styles.fieldLabel}
                                                htmlFor="nome"
                                            >
                                                Nome Completo
                                            </label>
                                            <input
                                                type="text"
                                                name="nome"
                                                id="nome"
                                                required
                                                minLength={3}
                                                value={formData.nome}
                                                onChange={handleChange}
                                                placeholder="Digite o nome"
                                                className={styles.fieldInput}
                                                {...validation.field(
                                                    'nome',
                                                    validarFormulario,
                                                )}
                                                maxLength={50}
                                            />
                                            <FieldErrors
                                                errors={validation.errors}
                                                name="nome"
                                            />
                                        </div>

                                        <div className={styles.fieldGroup}>
                                            <label
                                                className={styles.fieldLabel}
                                                htmlFor="cpf"
                                            >
                                                CPF
                                            </label>
                                            <input
                                                type="text"
                                                name="cpf"
                                                id="cpf"
                                                required
                                                maxLength={14}
                                                value={formData.cpf}
                                                onChange={handleChange}
                                                placeholder="000.000.000-00"
                                                className={styles.fieldInput}
                                                {...validation.field(
                                                    'cpf',
                                                    validarFormulario,
                                                )}
                                            />
                                            <FieldErrors
                                                errors={validation.errors}
                                                name="cpf"
                                            />
                                        </div>

                                        <div className={styles.fieldGroup}>
                                            <label
                                                className={styles.fieldLabel}
                                                htmlFor="dataNascimento"
                                            >
                                                Data de Nascimento
                                            </label>
                                            <input
                                                type="date"
                                                name="dataNascimento"
                                                id="dataNascimento"
                                                required
                                                value={String(
                                                    formData.dataNascimento,
                                                )}
                                                onChange={handleChange}
                                                className={styles.fieldInput}
                                                {...validation.field(
                                                    'dataNascimento',
                                                    validarFormulario,
                                                )}
                                            />
                                            <FieldErrors
                                                errors={validation.errors}
                                                name="dataNascimento"
                                            />
                                        </div>

                                        <div className={styles.fieldGroup}>
                                            <label
                                                className={styles.fieldLabel}
                                                htmlFor="telefone"
                                            >
                                                Telefone
                                            </label>
                                            <input
                                                type="tel"
                                                name="telefone"
                                                id="telefone"
                                                value={formData.telefone}
                                                onChange={handleChange}
                                                placeholder="(xx) x xxxx-xxxx"
                                                className={styles.fieldInput}
                                                {...validation.field(
                                                    'telefone',
                                                    validarFormulario,
                                                )}
                                                maxLength={20}
                                            />
                                            <FieldErrors
                                                errors={validation.errors}
                                                name="telefone"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <AccountFields
                        value={credenciais}
                        onChange={setCredenciais}
                        errors={validation.errors}
                        fieldProps={(name) =>
                            validation.field(name, validarFormulario)
                        }
                    />
                    {/* Botões */}
                    <div className={styles.buttonGroup}>
                        <button
                            type="submit"
                            disabled={salvando}
                            className={styles.buttonPrimary}
                        >
                            {salvando ? 'Cadastrando...' : 'Cadastrar Paciente'}
                        </button>

                        <button
                            type="button"
                            className={styles.buttonSecondary}
                            onClick={() =>
                                navigate(
                                    localStorage.getItem('role') === 'ADMIN'
                                        ? '/lista/paciente'
                                        : '/login',
                                )
                            }
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </form>
        </main>
    );
}

export default FormPaciente;
