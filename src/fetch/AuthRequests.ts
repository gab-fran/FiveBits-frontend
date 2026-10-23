import { request, ApiError } from './ApiClient';
import { parseLogin } from '../validation/inputs';
interface Usuario {
    id_usuario: number;
    nome: string;
    email: string;
    role: 'ADMIN' | 'MEDICO' | 'PACIENTE';
    idPaciente?: number | null;
    idMedico?: number | null;
}
export function clearSession() {
    for (const key of [
        'token',
        'nome',
        'idUsuario',
        'email',
        'role',
        'isAuth',
        'idPaciente',
        'idMedico',
    ])
        localStorage.removeItem(key);
}
class AuthRequests {
    async login(login: { email: string; senha: string }) {
        const data = await request<{
            auth: boolean;
            token: string;
            usuario: Usuario;
        }>('/api/login', {
            method: 'POST',
            body: JSON.stringify(parseLogin(login)),
        });
        if (
            data.auth !== true ||
            typeof data.token !== 'string' ||
            !data.usuario ||
            !Number.isInteger(data.usuario.id_usuario)
        )
            throw new ApiError(
                500,
                'RESPOSTA_INVALIDA',
                'Resposta de autenticação inválida.',
            );
        this.persistToken(data.token, data.usuario, true);
        return true;
    }
    persistToken(token: string, usuario: Usuario, isAuth: boolean) {
        clearSession();
        for (const [key, value] of Object.entries({
            token,
            nome: usuario.nome ?? '',
            idUsuario: usuario.id_usuario,
            email: usuario.email,
            role: usuario.role,
            isAuth,
            idPaciente: usuario.idPaciente ?? '',
            idMedico: usuario.idMedico ?? '',
        }))
            localStorage.setItem(key, String(value));
        window.dispatchEvent(new Event('auth-changed'));
    }
    removeToken() {
        clearSession();
        window.dispatchEvent(new Event('auth-changed'));
        window.location.assign('/login');
    }
    checkTokenExpiry() {
        try {
            if (localStorage.getItem('isAuth') !== 'true') return false;
            const token = localStorage.getItem('token');
            if (!token) return false;
            const encoded = token.split('.')[1];
            if (!encoded) return false;
            const payload = JSON.parse(
                atob(encoded.replace(/-/g, '+').replace(/_/g, '/')),
            );
            return (
                typeof payload.exp === 'number' &&
                Number.isFinite(payload.exp) &&
                payload.exp > Math.floor(Date.now() / 1000)
            );
        } catch {
            return false;
        }
    }
}
export default new AuthRequests();
