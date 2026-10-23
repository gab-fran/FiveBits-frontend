import { request } from './ApiClient';
import type { MedicoDTO } from '../dto/MedicoDTO';
type Cadastro = Omit<MedicoDTO, 'idMedico' | 'situacao'> & {
    email: string;
    senha: string;
};
class MedicoRequests {
    obterListaDeMedicos() {
        return request<MedicoDTO[]>('/api/medicos');
    }
    obterMedicoPorId(id: number) {
        return request<MedicoDTO>(`/api/medicos/${id}`);
    }
    async enviarFormularioMedico(data: Cadastro) {
        await request('/api/medicos', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return true;
    }
    async atualizarMedico(data: MedicoDTO) {
        const { idMedico, ...body } = data;
        await request(`/api/medicos/${idMedico}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
        return true;
    }
    async deletarMedico(id: number) {
        await request(`/api/medicos/${id}`, { method: 'DELETE' });
        return true;
    }
}
export default new MedicoRequests();
