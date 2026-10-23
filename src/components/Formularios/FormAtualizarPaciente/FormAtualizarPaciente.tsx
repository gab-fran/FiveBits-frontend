import { parsePaciente } from '../../../validation/inputs';
import { FieldErrors } from '../Validation/FormErrors';
import { useFormErrors } from '../Validation/useFormErrors';
import { useEffect, useState, type JSX } from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { useNavigate } from 'react-router-dom';
import PacienteRequest from '../../../fetch/PacienteRequest';
import type { PacienteDTO } from '../../../dto/PacienteDTO';
import Utilitario from '../../../utils/Utilitario';
import { AlertCard, type AlertVariant } from '../../AlertCard';
import styles from '../../../styles/DetalhesPadrao.module.css';

interface FormAtualizarPacienteProps {
    idPaciente: number;
}

interface AlertaState {
    variant: AlertVariant;
    title?: string;
    message: string;
    type?: 'banner' | 'toast';
}

function formatarDataParaInput(data: Date | string): string {
    const valor = String(data);
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return valor;
    }

    const dataBrasileira = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dataBrasileira) {
        return `${dataBrasileira[3]}-${dataBrasileira[2]}-${dataBrasileira[1]}`;
    }

    const dataConvertida = new Date(valor);
    if (Number.isNaN(dataConvertida.getTime())) {
        return '';
    }

    return dataConvertida.toISOString().slice(0, 10);
}

function FormAtualizarPaciente({
    idPaciente,
}: FormAtualizarPacienteProps): JSX.Element {
    const navigate = useNavigate();
    const validation = useFormErrors();
    const [formData, setFormData] = useState<PacienteDTO>({
        nome: '',
        cpf: '',
        telefone: '',
        dataNascimento: '',
    });
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [alerta, setAlerta] = useState<AlertaState | null>(null);

    useEffect(() => {
        async function carregarPaciente() {
            try {
                const paciente =
                    await PacienteRequest.obterPacientePorId(idPaciente);
                if (!paciente) {
                    setErro('Paciente não encontrado.');
                    return;
                }

                setFormData({
                    ...paciente,
                    cpf: Utilitario.formatarCpf(paciente.cpf),
                    telefone: paciente.telefone
                        ? Utilitario.formatarTelefone(paciente.telefone)
                        : '',
                    dataNascimento: formatarDataParaInput(
                        paciente.dataNascimento,
                    ),
                });
            } catch {
                setErro('Não foi possível carregar os dados do paciente.');
            } finally {
                setCarregando(false);
            }
        }

        carregarPaciente();
    }, [idPaciente]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === 'cpf'
                    ? Utilitario.formatarCpf(value)
                    : name === 'telefone'
                      ? Utilitario.formatarTelefone(value)
                      : value,
        }));
    };

    const validarFormulario = () =>
        parsePaciente({
            nome: formData.nome,
            cpf: formData.cpf,
            telefone: formData.telefone,
            dataNascimento: formData.dataNascimento,
        });
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (salvando) return;
        validation.clear();
        setAlerta(null);
        try {
            const parsed = validarFormulario();
            const data = {
                nome: parsed.nome,
                cpf: parsed.cpf,
                telefone: parsed.telefone,
                dataNascimento: parsed.dataNascimento,
            };
            setSalvando(true);
            await PacienteRequest.atualizarPaciente(idPaciente, data);
            navigate(`/detalhes/paciente/${idPaciente}`, {
                state: {
                    alerta: {
                        variant: 'success',
                        message: 'Dados atualizados com sucesso!',
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

    if (carregando) {
        return (
            <main
                className={`${styles.detailsWrapper} ${styles.centeredFormWrapper}`}
            >
                <p>Carregando dados do paciente...</p>
            </main>
        );
    }

    if (erro) {
        return (
            <main
                className={`${styles.detailsWrapper} ${styles.centeredFormWrapper}`}
            >
                <div className={styles.cardContainer}>
                    <AlertCard
                        variant="danger"
                        type="toast"
                        title="Erro de Carregamento"
                        message={erro}
                        actionLabel="Voltar para a Lista"
                        onAction={() => navigate('/lista/paciente')}
                    />
                </div>
            </main>
        );
    }

    return (
        <main
            className={`${styles.detailsWrapper} ${styles.centeredFormWrapper}`}
        >
            {alerta && (
                <div style={{ marginBottom: '1.25rem' }}>
                    <AlertCard
                        variant={alerta.variant}
                        type={alerta.type || 'toast'}
                        title={alerta.title}
                        message={alerta.message}
                        onClose={() => setAlerta(null)}
                    />
                </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.cardContainer}>
                    <Card className={styles.detailsCard}>
                        <div className={styles.cardContent}>
                            {/* Cabeçalho */}
                            <div className={styles.detailsHeader}>
                                <h2 className={styles.headerTitle}>
                                    Atualização de Paciente
                                </h2>
                                <div className={styles.headerSubtitle}>
                                    <span>
                                        Altere os dados abaixo e salve as
                                        informações do paciente.
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

                    {/* Botões */}
                    <div className={styles.buttonGroup}>
                        <button
                            type="submit"
                            disabled={salvando}
                            className={styles.buttonPrimary}
                        >
                            {salvando ? 'Salvando...' : 'Atualizar Paciente'}
                        </button>

                        <button
                            type="button"
                            className={styles.buttonSecondary}
                            onClick={() =>
                                navigate(`/detalhes/paciente/${idPaciente}`)
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

export default FormAtualizarPaciente;
