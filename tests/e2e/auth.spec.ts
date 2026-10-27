import { DEMO, expect, test } from '../fixtures/app'

test.describe('account and session', () => {
  test('registers a new account, logs in automatically and honours the redirect', async ({
    app,
    page,
  }) => {
    await app.goto('/register?redirect=%2Ffavorites')
    const form = page.getByTestId('register-form')
    await form.getByLabel('Nome completo').fill('Carla Nova')
    await form.getByLabel('E-mail').fill('carla@example.com')
    await form.getByLabel('Senha', { exact: true }).fill('NovaSenha1')
    await form.getByLabel('Confirmar senha').fill('NovaSenha1')
    await form.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page).toHaveURL(/\/favorites$/)
    await expect(page.getByTestId('header-user-menu')).toBeVisible()
    await expect(page.getByTestId('empty-state')).toContainText('Nenhum favorito ainda')
  })

  test('validates the register form on the client before calling the API', async ({
    app,
    page,
  }) => {
    await app.goto('/register')
    const form = page.getByTestId('register-form')
    await form.getByLabel('Nome completo').fill('A')
    await form.getByLabel('E-mail').fill('nao-e-email')
    await form.getByLabel('Senha', { exact: true }).fill('curta')
    await form.getByLabel('Confirmar senha').fill('outra')
    await form.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page.getByText('Informe seu nome.')).toBeVisible()
    await expect(page.getByText('Informe um e-mail válido.')).toBeVisible()
    await expect(page.getByText('A senha deve ter pelo menos 8 caracteres.')).toBeVisible()
    await expect(page.getByText('As senhas não coincidem.')).toBeVisible()
    await expect(form.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true')
    await expect(page).toHaveURL(/\/register$/)
  })

  test('shows a conflict when the e-mail is already registered', async ({ app, page }) => {
    await app.goto('/register')
    const form = page.getByTestId('register-form')
    await form.getByLabel('Nome completo').fill('Ana Duplicada')
    await form.getByLabel('E-mail').fill(DEMO.ana.email)
    await form.getByLabel('Senha', { exact: true }).fill('NovaSenha1')
    await form.getByLabel('Confirmar senha').fill('NovaSenha1')
    await form.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page.getByText('Este e-mail já está cadastrado.')).toBeVisible()
    await expect(form.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByTestId('header-user-menu')).toHaveCount(0)
  })

  test('rejects wrong credentials with an accessible error', async ({ app, page }) => {
    await app.goto('/login')
    const form = page.getByTestId('login-form')
    await form.getByLabel('E-mail').fill(DEMO.ana.email)
    await form.getByLabel('Senha', { exact: true }).fill('errada123')
    await form.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByTestId('form-error')).toContainText('E-mail ou senha inválidos')
    await expect(page.getByTestId('form-error')).toHaveAttribute('role', 'alert')
  })

  test('logs in, keeps the session after refresh and returns to the previous flow', async ({
    app,
    page,
  }) => {
    await app.goto('/favorites')
    await expect(page).toHaveURL(/\/login\?redirect=%2Ffavorites/)
    await expect(page.getByTestId('login-reason')).toBeVisible()
    await app.login()
    await expect(page).toHaveURL(/\/favorites$/)
    await expect(page.getByTestId('favorites-grid').getByTestId('nft-card')).toHaveCount(2)

    await page.reload()
    await expect(page.getByTestId('header-user-menu')).toBeVisible()
    await expect(page.getByTestId('favorites-grid').getByTestId('nft-card')).toHaveCount(2)
  })

  test('expired session redirects to login and resumes the private page after re-login', async ({
    app,
    page,
  }) => {
    await app.goto('/login')
    await app.login()
    await page.goto('/favorites')
    await expect(page.getByTestId('favorites-grid')).toBeVisible()

    // Server-side expiry (simulated), then any private request fails with 401.
    await page.evaluate(() => window.__mock!.expireSessions())
    await page.getByRole('link', { name: 'Início' }).first().click()
    await page.goto('/account/profile')

    await expect(page).toHaveURL(/\/login\?.*reason=expired/)
    await expect(page.getByTestId('login-reason')).toContainText('Sua sessão expirou')
    await app.login()
    await expect(page).toHaveURL(/\/account\/profile$/)
  })

  test('logout clears the session and private routes require login again', async ({
    app,
    page,
  }) => {
    await app.goto('/login')
    await app.login()
    await app.logout()
    await expect(page).toHaveURL(/\/$/)

    await page.goto('/favorites')
    await expect(page).toHaveURL(/\/login\?redirect=/)
  })

  test('switching users never shows the previous user data', async ({ app, page }) => {
    test.setTimeout(60_000)
    await app.goto('/login')
    await app.login(DEMO.ana.email, DEMO.ana.password)
    await page.goto('/favorites')
    await expect(page.getByTestId('favorites-grid').getByTestId('nft-card')).toHaveCount(2)

    await app.logout()

    await page.goto('/login')
    await app.login(DEMO.bruno.email, DEMO.bruno.password)
    await page.goto('/favorites')
    await expect(page.getByTestId('empty-state')).toContainText('Nenhum favorito ainda')
    await page.getByTestId('header-user-menu').click()
    await expect(page.getByRole('menu')).toContainText(DEMO.bruno.email)
  })
})
