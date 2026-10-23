import { consultaPayload } from '../../../fetch/ConsultaRequest';
import { FieldErrors } from '../Validation/FormErrors';
import { useFormErrors } from '../Validation/useFormErrors';
import Utilitario from '../../../utils/Utilitario';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ConsultaRequest from '../../../fetch/ConsultaRequest';
import MedicoRequests from '../../../fetch/MedicoRequest';
import PacienteRequests from '../../../fetch/PacienteRequest';
import { AlertCard, type AlertVariant } from '../../AlertCard';

import styles from '../../../styles/DetalhesPadrao.module.css';

import type { ConsultaDTO } from '../../../dto/ConsultaDTO';
import type { MedicoDTO } from '../../../dto/MedicoDTO';
import type { PacienteDTO } from '../../../dto/PacienteDTO';

interface FormConsultaProps {
    idConsulta?: number;
}

interface AlertaState {
    variant: AlertVariant;
    title?: string;
    message: string;
    type?: 'banner' | 'toast';
}

function FormConsulta({ idConsulta }: FormConsultaProps) {
    const navigate = useNavigate();
    const validation = useFormErrors();
    const [salvando, setSalvando] = useState(false);

    const [listaPacientes, setListaPacientes] = useState<PacienteDTO[]>([]);
    const [listaMedicos, setListaMedicos] = useState<MedicoDTO[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [alerta, setAlerta] = useState<AlertaState | null>(null);
    const modoEdicao = idConsulta !== undefined;

    const [formData, setFormData] = useState<ConsultaDTO>({
        dataHora: '',
        duracaoMinutos: 0,
        status: 'Pendente',
        modalidade: 'Pessoalmente',
        triagemSintomas: '',
        situacao: true,

        paciente: {
            idPaciente: 0,
            nomePaciente: '',
            cpf: '',
            telefone: '',
            dataNascimento: '',
            situacao: true,
        },

        medico: {
            idMedico: 0,
            nomeMedico: '',
            crm: '',
            especialidade: '',
            valorConsulta: 0,
            situacao: true,
        },
    });

    useEffect(() => {
        async function carregarDados() {
            setCarregando(true);

            try {
                const [pacientes, medicos, consulta] = await Promise.all([
                    localStorage.getItem('role') === 'MEDICO'
                        ? Promise.resolve([] as PacienteDTO[])
                        : PacienteRequests.obterListaDePacientes(),
                    MedicoRequests.obterListaDeMedicos(),
                    modoEdicao
                        ? ConsultaRequest.obterConsultaPorId(idConsulta)
                        : Promise.resolve(undefined),
                ]);

                if (pacientes) {
                    setListaPacientes(pacientes);
                    if (
                        !modoEdicao &&
                        localStorage.getItem('role') === 'PACIENTE' &&
                        pacientes[0]?.idPaciente
                    ) {
                        setFormData((current) => ({
                            ...current,
                            paciente: {
                                ...current.paciente,
                                idPaciente: pacientes[0]!.idPaciente!,
                            },
                        }));
                    }
                }
                if (medicos) setListaMedicos(medicos as MedicoDTO[]);
                if (consulta) {
                    setFormData(consulta);
                    if (localStorage.getItem('role') === 'MEDICO')
                        setListaPacientes([
                            {
                                idPaciente: consulta.paciente.idPaciente,
                                nome: consulta.paciente.nomePaciente,
                                cpf: consulta.paciente.cpf,
                                telefone: consulta.paciente.telefone,
                                dataNascimento:
                                    consulta.paciente.dataNascimento,
                            },
                        ]);
                }
            } catch {
                setAlerta({
                    variant: 'danger',
                    message:
                        'Não foi possível carregar os dados. Tente novamente.',
                });
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, [idConsulta, modoEdicao]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value } = e.target;

        if (name === 'idPaciente') {
            setFormData((prev) => ({
                ...prev,
                paciente: {
                    ...prev.paciente,
                    idPaciente: Number(value),
                },
            }));
        } else if (name === 'idMedico') {
            setFormData((prev) => ({
                ...prev,
                medico: {
                    ...prev.medico,
                    idMedico: Number(value),
                },
            }));
        } else if (name === 'dataHora') {
            setFormData((prev) => ({
                ...prev,
                dataHora: value ? `${value}:00-03:00` : '',
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: name === 'duracaoMinutos' ? Number(value) : value,
            }));
        }
    };

    const validarFormulario = () => consultaPayload(formData, modoEdicao);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (salvando) return;
        validation.clear();
        setAlerta(null);
        try {
            validarFormulario();
            setSalvando(true);
            if (modoEdicao) await ConsultaRequest.atualizarConsulta(formData);
            else await ConsultaRequest.enviarFormularioConsulta(formData);
            navigate('/lista/consulta', {
                state: {
                    alerta: {
                        variant: 'success',
                        message: modoEdicao
                            ? 'Consulta atualizada com sucesso!'
                            : 'Consulta agendada com sucesso!',
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
        <main className={styles.detailsWrapper}>
            {alerta && (
                <div
                    style={{
                        marginBottom: '1.25rem',
                        maxWidth: '800px',
                        marginInline: 'auto',
                    }}
                >
                    <AlertCard
                        variant={alerta.variant}
                        type={alerta.type || 'toast'}
                        title={alerta.title}
                        message={alerta.message}
                        onClose={() => setAlerta(null)}
                    />
                </div>
            )}
            {carregando ? (
                <p>Carregando dados...</p>
            ) : (
                <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.cardContainer}>
                        <div className={styles.detailsCard}>
                            <div className={styles.cardContent}>
                                {/* Cabeçalho */}
                                <div className={styles.detailsHeader}>
                                    <h2 className={styles.headerTitle}>
                                        {modoEdicao
                                            ? 'Atualização de Consulta'
                                            : 'Cadastro de Consulta'}
                                    </h2>

                                    <div className={styles.headerSubtitle}>
                                        <span>
                                            {modoEdicao
                                                ? 'Altere os dados abaixo e salve as informações da consulta.'
                                                : 'Preencha os dados abaixo para registrar uma nova consulta.'}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.infoGrid}>
                                    {/* Paciente */}
                                    <div className={styles.infoSection}>
                                        <h3 className={styles.sectionTitle}>
                                            <i className="pi pi-user text-green-500 text-sm"></i>{' '}
                                            Paciente
                                        </h3>

                                        <div className={styles.sectionText}>
                                            <div className={styles.fieldGroup}>
                                                <label
                                                    className={
                                                        styles.fieldLabel
                                                    }
                                                    htmlFor="idPaciente"
                                                >
                                                    Paciente
                                                </label>

                                                <select
                                                    id="idPaciente"
                                                    name="idPaciente"
                                                    disabled={
                                                        modoEdicao ||
                                                        localStorage.getItem(
                                                            'role',
                                                        ) === 'PACIENTE'
                                                    }
                                                    required
                                                    value={
                                                        formData.paciente
                                                            .idPaciente || ''
                                                    }
                                                    onChange={handleChange}
                                                    className={
                                                        styles.fieldInput
                                                    }
                                                    {...validation.field(
                                                        'idPaciente',
                                                        validarFormulario,
                                                    )}
                                                >
                                                    <option value="">
                                                        Selecione um paciente
                                                    </option>

                                                    {listaPacientes.map(
                                                        (paciente) => (
                                                            <option
                                                                key={
                                                                    paciente.idPaciente
                                                                }
                                                                value={
                                                                    paciente.idPaciente
                                                                }
                                                            >
                                                                {paciente.nome}{' '}
                                                                - {paciente.cpf}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <FieldErrors
                                                    errors={validation.errors}
                                                    name="idPaciente"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Médico */}
                                    <div className={styles.infoSection}>
                                        <h3 className={styles.sectionTitle}>
                                            <i className="pi pi-briefcase text-orange-500 text-sm"></i>{' '}
                                            Médico
                                        </h3>

                                        <div className={styles.sectionText}>
                                            <div className={styles.fieldGroup}>
                                                <label
                                                    className={
                                                        styles.fieldLabel
                                                    }
                                                    htmlFor="idMedico"
                                                >
                                                    Médico
                                                </label>

                                                <select
                                                    id="idMedico"
                                                    name="idMedico"
                                                    required
                                                    value={
                                                        formData.medico
                                                            .idMedico || ''
                                                    }
                                                    onChange={handleChange}
                                                    className={
                                                        styles.fieldInput
                                                    }
                                                    {...validation.field(
                                                        'idMedico',
                                                        validarFormulario,
                                                    )}
                                                >
                                                    <option value="">
                                                        Selecione um médico
                                                    </option>

                                                    {listaMedicos.map(
                                                        (medico) => (
                                                            <option
                                                                key={
                                                                    medico.idMedico
                                                                }
                                                                value={
                                                                    medico.idMedico
                                                                }
                                                            >
                                                                {medico.nome} -{' '}
                                                                {
                                                                    medico.especialidade
                                                                }
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <FieldErrors
                                                    errors={validation.errors}
                                                    name="idMedico"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dados da Consulta */}
                                    <div className={styles.infoSection}>
                                        <h3 className={styles.sectionTitle}>
                                            <i className="pi pi-calendar text-blue-500 text-sm"></i>{' '}
                                            Dados da Consulta
                                        </h3>

                                        <div className={styles.sectionText}>
                                            <div className={styles.fieldGroup}>
                                                <label
                                                    className={
                                                        styles.fieldLabel
                                                    }
                                                    htmlFor="dataHora"
                                                >
                                                    Data e Hora
                                                </label>

                                                <input
                                                    id="dataHora"
                                                    type="datetime-local"
                                                    name="dataHora"
                                                    required
                                                    value={Utilitario.formatarDataHoraInput(
                                                        formData.dataHora,
                                                    )}
                                                    onChange={handleChange}
                                                    className={
                                                        styles.fieldInput
                                                    }
                                                    {...validation.field(
                                                        'dataHora',
                                                        validarFormulario,
                                                    )}
                                                />
                                                <FieldErrors
                                                    errors={validation.errors}
                                                    name="dataHora"
                                                />
                                            </div>

                                            <div className={styles.fieldGroup}>
                                                <label htmlFor="duracaoMinutos">
                                                    Duração (minutos)
                                                </label>
                                                <input
                                                    id="duracaoMinutos"
                                                    name="duracaoMinutos"
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    required
                                                    value={
                                                        formData.duracaoMinutos ||
                                                        ''
                                                    }
                                                    onChange={handleChange}
                                                    className={
                                                        styles.fieldInput
                                                    }
                                                    {...validation.field(
                                                        'duracaoMinutos',
                                                        validarFormulario,
                                                    )}
                                                />
                                                <FieldErrors
                                                    errors={validation.errors}
                                                    name="duracaoMinutos"
                                                />
                                            </div>
                                            <div className={styles.fieldGroup}>
                                                <label
                                                    className={
                                                        styles.fieldLabel
                                                    }
                                                    htmlFor="modalidade"
                                                >
                                                    Modalidade
                                                </label>

                                                <select
                                                    id="modalidade"
                                                    name="modalidade"
                                                    value={formData.modalidade}
                                                    onChange={handleChange}
                                                    className={
                                                        styles.fieldInput
                                                    }
                                                    {...validation.field(
                                                        'modalidade',
                                                        validarFormulario,
                                                    )}
                                                >
                                                    <option value="Pessoalmente">
                                                        Pessoalmente
                                                    </option>

                                                    <option value="Telemedicina">
                                                        Telemedicina
                                                    </option>
                                                </select>
                                                <FieldErrors
                                                    errors={validation.errors}
                                                    name="modalidade"
                                                />
                                            </div>

                                            <div className={styles.fieldGroup}>
                                                <label
                                                    className={
                                                        styles.fieldLabel
                                                    }
                                                    htmlFor="status"
                                                >
                                                    Status
                                                </label>

                                                <select
                                                    id="status"
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                    className={
                                                        styles.fieldInput
                                                    }
                                                    {...validation.field(
                                                        'status',
                                                        validarFormulario,
                                                    )}
                                                >
                                                    <option value="Pendente">
                                                        Pendente
                                                    </option>

                                                    <option value="Confirmado">
                                                        Confirmado
                                                    </option>
                                                    {modoEdicao &&
                                                        localStorage.getItem(
                                                            'role',
                                                        ) !== 'PACIENTE' && (
                                                            <option value="Concluido">
                                                                Concluído
                                                            </option>
                                                        )}
                                                </select>
                                                <FieldErrors
                                                    errors={validation.errors}
                                                    name="status"
                                                />
                                            </div>

                                            <div className={styles.fieldGroup}>
                                                <label
                                                    className={
                                                        styles.fieldLabel
                                                    }
                                                    htmlFor="triagemSintomas"
                                                >
                                                    Triagem de Sintomas
                                                </label>

                                                <textarea
                                                    id="triagemSintomas"
                                                    name="triagemSintomas"
                                                    rows={5}
                                                    required
                                                    value={
                                                        formData.triagemSintomas
                                                    }
                                                    onChange={handleChange}
                                                    className={
                                                        styles.fieldInput
                                                    }
                                                    placeholder="Descreva os sintomas do paciente"
                                                    {...validation.field(
                                                        'triagemSintomas',
                                                        validarFormulario,
                                                    )}
                                                    maxLength={100}
                                                />
                                                <FieldErrors
                                                    errors={validation.errors}
                                                    name="triagemSintomas"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className={styles.buttonGroup}>
                            <button
                                type="submit"
                                disabled={salvando}
                                className={styles.buttonPrimary}
                            >
                                {modoEdicao
                                    ? 'Atualizar Consulta'
                                    : 'Cadastrar Consulta'}
                            </button>

                            <button
                                type="button"
                                className={styles.buttonSecondary}
                                onClick={() => navigate('/lista/consulta')}
                            >
                                Voltar
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </main>
    );
}

export default FormConsulta;
