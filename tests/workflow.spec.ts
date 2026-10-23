import { test, expect } from '@playwright/test';
const password = 'e2e-only-password';
async function login(page: import('@playwright/test').Page, email: string) {
    await page.goto('/login');
    await page.locator('[name=email]').fill(email);
    await page.locator('[name=senha]').fill(password);
    await page.getByRole('button', { name: 'Entrar na sua conta' }).click();
    await expect(page).toHaveURL(/bem-vindo/);
}
test('cadastro público valida antes de enviar e cria conta utilizável', async ({
    page,
}) => {
    let requests = 0;
    page.on('request', (r) => {
        if (r.method() === 'POST' && r.url().endsWith('/api/pacientes'))
            requests++;
    });
    await page.goto('/cadastro/paciente');
    await page.locator('[name=nome]').fill('Paciente Navegador');
    await page.locator('[name=cpf]').fill('11111111111');
    await page.locator('[name=dataNascimento]').fill('1990-01-01');
    await page.locator('[name=telefone]').fill('11999991234');
    await page.locator('[name=email]').fill('patient@e2e.test');
    await page.locator('[name=senha]').fill(password);
    await page
        .getByRole('button', { name: 'Cadastrar Paciente', exact: true })
        .click();
    await expect(page.locator('#erro-cpf')).toContainText('CPF válido');
    expect(requests).toBe(0);
    await page.locator('[name=cpf]').fill('52998224725');
    await page
        .getByRole('button', { name: 'Cadastrar Paciente', exact: true })
        .click();
    await expect(page).toHaveURL(/login/);
    expect(requests).toBe(1);
    await login(page, 'patient@e2e.test');
    await page.goto('/cadastro/medico');
    await expect(page).toHaveURL(/lista\/consulta/);
});
test('administrador cadastra médico com credenciais; paciente agenda duração variável', async ({
    page,
    request,
}) => {
    const created = await request.post('http://127.0.0.1:3334/api/pacientes', {
        data: {
            nome: 'Paciente Agenda',
            cpf: '11144477735',
            telefone: '11999991234',
            dataNascimento: '1990-01-01',
            email: 'schedule@e2e.test',
            senha: password,
        },
    });
    expect(created.status()).toBe(201);
    await login(page, 'admin@e2e.test');
    await page.goto('/cadastro/medico');
    await page.locator('[name=nome]').fill('Médico Navegador');
    await page.locator('[name=crm]').fill('12345SP');
    await page.locator('[name=especialidade]').fill('Clínica');
    await page.locator('[name=valorConsulta]').fill('0');
    await page.locator('[name=email]').fill('doctor@e2e.test');
    await page.locator('[name=senha]').fill(password);
    await page
        .getByRole('button', { name: 'Cadastrar Médico', exact: true })
        .click();
    await expect(page).toHaveURL(/lista\/medico/);
    await login(page, 'schedule@e2e.test');
    await page.goto('/cadastro/consulta');
    await page
        .locator('[name=idMedico]')
        .selectOption({ label: 'Médico Navegador - Clínica' });
    await expect(page.locator('[name=idPaciente]')).toBeDisabled();
    await expect(page.locator('[name=idPaciente]')).not.toHaveValue('');
    await page.locator('[name=dataHora]').fill('2035-05-10T09:00');
    await page.locator('[name=duracaoMinutos]').fill('45');
    await page
        .locator('[name=triagemSintomas]')
        .fill('Dor <img src=x onerror=window.injected=1>');
    await page
        .getByRole('button', { name: 'Cadastrar Consulta', exact: true })
        .click();
    await expect(page).toHaveURL(/lista\/consulta/);
    await expect(page.getByText('09:00', { exact: false })).toBeVisible();
    await expect(
        page.getByText('Dor <img src=x onerror=window.injected=1>', {
            exact: true,
        }),
    ).toBeVisible();
    expect(
        await page.evaluate(
            () => (window as Window & { injected?: number }).injected,
        ),
    ).toBeUndefined();
    await page.getByRole('button', { name: 'Atualizar', exact: true }).click();
    await expect(page.locator('[name=dataHora]')).toHaveValue(
        '2035-05-10T09:00',
    );
    await expect(page.locator('[name=duracaoMinutos]')).toHaveValue('45');
    await expect(page.locator('[name=idPaciente]')).toBeDisabled();
    await login(page, 'admin@e2e.test');
    await page.goto('/lista/medico');
    await page
        .getByRole('button', { name: 'Deletar', exact: true })
        .first()
        .click();
    await page.getByRole('button', { name: 'Confirmar', exact: false }).click();
    await expect(
        page.getByText(
            'Cancele as consultas futuras antes de desativar o cadastro.',
            { exact: false },
        ),
    ).toBeVisible();
});
test('sessão falsa ou JWT malformado não abre telas privadas', async ({
    page,
}) => {
    await page.goto('/');
    await page.evaluate(() => {
        localStorage.setItem('isAuth', 'false');
        localStorage.setItem('token', 'not-a-token');
    });
    await page.goto('/lista/paciente');
    await expect(page).toHaveURL(/login/);
});
