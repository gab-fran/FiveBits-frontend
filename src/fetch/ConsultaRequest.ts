import { request } from './ApiClient';
import type { ConsultaDTO } from '../dto/ConsultaDTO';
import { parseConsulta } from '../validation/inputs';
export function consultaPayload(data: ConsultaDTO, editing = false) {
    return parseConsulta(
        {
            idPaciente: data.paciente.idPaciente,
            idMedico: data.medico.idMedico,
            dataHora: data.dataHora,
            duracaoMinutos: data.duracaoMinutos,
            status: data.status,
            modalidade: data.modalidade,
            triagemSintomas: data.triagemSintomas,
        },
        editing,
    );
}
class ConsultaRequests {
    obterListaDeConsultas() {
        return request<ConsultaDTO[]>('/api/consultas');
    }
    obterConsultaPorId(id: number) {
        return request<ConsultaDTO>(`/api/consultas/${id}`);
    }
    async enviarFormularioConsulta(data: ConsultaDTO) {
        await request('/api/consultas', {
            method: 'POST',
            body: JSON.stringify(consultaPayload(data)),
        });
        return true;
    }
    async atualizarConsulta(data: ConsultaDTO) {
        await request(`/api/consultas/${data.idConsulta}`, {
            method: 'PUT',
            body: JSON.stringify(consultaPayload(data, true)),
        });
        return true;
    }
    async deletarConsulta(id: number) {
        await request(`/api/consultas/${id}`, { method: 'DELETE' });
        return true;
    }
}
export default new ConsultaRequests();
