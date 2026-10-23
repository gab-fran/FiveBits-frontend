import { request } from './ApiClient';
import type { PacienteDTO } from '../dto/PacienteDTO';
type Cadastro = PacienteDTO & { email: string; senha: string };
class PacienteRequests {
    obterListaDePacientes() {
        return request<PacienteDTO[]>('/api/pacientes');
    }
    obterPacientePorId(id: number) {
        return request<PacienteDTO>(`/api/pacientes/${id}`);
    }
    async enviarFormularioPaciente(data: Cadastro) {
        await request('/api/pacientes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return true;
    }
    async atualizarPaciente(id: number, data: PacienteDTO) {
        await request(`/api/pacientes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { sucesso: true };
    }
    async removerPaciente(id: number) {
        await request(`/api/pacientes/${id}`, { method: 'DELETE' });
        return true;
    }
}
export default new PacienteRequests();
