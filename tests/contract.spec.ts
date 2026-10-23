import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
test('validadores de entrada permanecem iguais nos dois repositórios', () => {
    expect(readFileSync('src/validation/inputs.ts', 'utf8')).toBe(
        readFileSync('../FiveBits-backend/src/validation/inputs.ts', 'utf8'),
    );
});
