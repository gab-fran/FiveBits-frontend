import { SERVER_CFG } from '../AppConfig';
import type { FieldError } from '../validation/inputs';

export class ApiError extends Error {
    readonly status: number;
    readonly codigo: string;
    readonly erros: FieldError[];
    constructor(
        status: number,
        codigo: string,
        mensagem: string,
        erros: FieldError[] = [],
    ) {
        super(mensagem);
        this.status = status;
        this.codigo = codigo;
        this.erros = erros;
    }
}
export async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    if (options.body) headers.set('Content-Type', 'application/json');
    const token = localStorage.getItem('token');
    if (token) headers.set('x-access-token', token);
    let response: Response;
    try {
        response = await fetch(`${SERVER_CFG.SERVER_URL}${path}`, {
            ...options,
            headers,
        });
    } catch {
        throw new ApiError(
            0,
            'REDE_INDISPONIVEL',
            'Não foi possível conectar ao servidor. Tente novamente.',
        );
    }
    const body = await response.json().catch(() => null);
    if (!response.ok) {
        if (response.status === 401) {
            for (const key of [
                'token',
                'nome',
                'idUsuario',
                'email',
                'role',
                'isAuth',
            ])
                localStorage.removeItem(key);
            window.dispatchEvent(new Event('auth-changed'));
        }
        throw new ApiError(
            response.status,
            body?.codigo ?? 'ERRO_API',
            body?.mensagem ??
                body?.message ??
                'Não foi possível concluir a operação.',
            Array.isArray(body?.erros) ? body.erros : [],
        );
    }
    if (body === null)
        throw new ApiError(
            response.status,
            'RESPOSTA_INVALIDA',
            'Resposta inválida do servidor.',
        );
    return body as T;
}
