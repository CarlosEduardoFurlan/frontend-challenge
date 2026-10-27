import { DEMO, expect, test } from '../fixtures/app'

// 2x2 red PNG used for the avatar upload.
const PNG_2X2 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEklEQVR4nGO8Y6PBwMDAxAAGAA/eAUSX0BIKAAAAAElFTkSuQmCC',
  'base64',
)

const VALID_ADDRESS = '0xAbCdEf0123456789aBcDeF0123456789AbCdEf01'

test.describe('collector profile', () => {
  test('edits name and bio, updates the header and persists after refresh', async ({
    app,
    page,
  }) => {
    await app.goto('/login')
    await app.login()
    await page.goto('/account/profile')
    const form = page.getByTestId('profile-form')
    await expect(form.getByLabel('Nome completo')).toHaveValue(DEMO.ana.name)

    await form.getByLabel('Nome completo').fill('Ana R. Ribeiro')
    await form.getByLabel('Bio').fill('Colecionando pixels desde sempre.')
    await form.getByRole('button', { name: 'Salvar alterações' }).click()
    await expect(page.getByTestId('toast')).toContainText('Perfil atualizado')
    await expect(page.getByTestId('header-user-menu')).toHaveAttribute(
      'aria-label',
      'Conta de Ana R. Ribeiro',
    )

    await page.reload()
    await expect(page.getByTestId('profile-form').getByLabel('Nome completo')).toHaveValue(
      'Ana R. Ribeiro',
    )
    await expect(page.getByTestId('profile-form').getByLabel('Bio')).toHaveValue(
      'Colecionando pixels desde sempre.',
    )
  })

  test('validates username format on the client and conflicts from the API', async ({
    app,
    page,
  }) => {
    await app.goto('/login')
    await app.login()
    await page.goto('/account/profile')
    const form = page.getByTestId('profile-form')
    await form.getByLabel('Nome de usuário').fill('Nome Inválido!')
    await form.getByRole('button', { name: 'Salvar alterações' }).click()
    await expect(
      form.getByText('Use apenas letras minúsculas, números, ponto e sublinhado.'),
    ).toBeVisible()

    await form.getByLabel('Nome de usuário').fill('bruno.c')
    await form.getByRole('button', { name: 'Salvar alterações' }).click()
    await expect(form.getByText('Este nome de usuário já está em uso.')).toBeVisible()
    await expect(form.getByLabel('Nome de usuário')).toHaveAttribute('aria-invalid', 'true')
  })

  test('uploads, previews and removes the avatar', async ({ app, page }) => {
    await app.goto('/login')
    await app.login(DEMO.bruno.email, DEMO.bruno.password)
    await page.goto('/account/profile')
    const form = page.getByTestId('profile-form')
    await expect(form.getByTestId('avatar-preview')).toHaveCount(0)

    await form
      .getByTestId('avatar-input')
      .setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: PNG_2X2 })
    await expect(form.getByTestId('avatar-preview')).toHaveAttribute(
      'src',
      /^data:image\/webp;base64,/,
    )
    await form.getByRole('button', { name: 'Salvar alterações' }).click()
    await expect(page.getByTestId('toast')).toContainText('Perfil atualizado')

    await page.reload()
    await expect(page.getByTestId('profile-form').getByTestId('avatar-preview')).toBeVisible()
    await page.getByTestId('avatar-remove').click()
    await page
      .getByTestId('profile-form')
      .getByRole('button', { name: 'Salvar alterações' })
      .click()
    await expect(page.getByTestId('toast').first()).toContainText('Perfil atualizado')
    await page.reload()
    await expect(page.getByTestId('profile-form').getByTestId('avatar-preview')).toHaveCount(0)
  })

  test('changes the password after rejecting a wrong current password', async ({ app, page }) => {
    await app.goto('/login')
    await app.login()
    await page.goto('/account/profile')
    const form = page.getByTestId('password-form')
    await form.getByLabel('Senha atual').fill('errada999')
    await form.getByLabel('Nova senha', { exact: true }).fill('NovaSenha1')
    await form.getByLabel('Confirmar nova senha').fill('NovaSenha1')
    await form.getByRole('button', { name: 'Alterar senha' }).click()
    await expect(form.getByText('A senha atual não confere.')).toBeVisible()

    await form.getByLabel('Senha atual').fill(DEMO.ana.password)
    await form.getByRole('button', { name: 'Alterar senha' }).click()
    await expect(page.getByTestId('toast')).toContainText('Senha alterada')

    await page.getByTestId('header-user-menu').click()
    await page.getByTestId('logout').click()
    await page.goto('/login')
    await app.login(DEMO.ana.email, 'NovaSenha1')
  })

  test('server-side validation errors are shown on the right fields', async ({ app, page }) => {
    await app.goto('/login')
    await app.login()
    await page.goto('/account/profile')
    await app.setScenario('validation-errors')
    const form = page.getByTestId('profile-form')
    await form.getByLabel('Nome completo').fill('Outro Nome')
    await form.getByRole('button', { name: 'Salvar alterações' }).click()
    await expect(form.getByText('Nome de usuário indisponível (simulação).')).toBeVisible()
  })
})

test.describe('wallets', () => {
  test('validates the address, creates primary then secondary and rejects duplicates', async ({
    app,
    page,
  }) => {
    await app.goto('/login')
    await app.login(DEMO.bruno.email, DEMO.bruno.password)
    await page.goto('/account/wallets')

    const secondary = page.getByTestId('wallet-secondary')
    await expect(secondary).toContainText('Cadastre a carteira principal antes')

    const primaryForm = page.getByTestId('wallet-primary-form')
    await primaryForm.getByLabel('Nome da carteira').fill('Principal')
    await primaryForm.getByLabel('Endereço').fill('0x123')
    await primaryForm.getByRole('button', { name: 'Cadastrar carteira' }).click()
    await expect(primaryForm.getByText(/Endereço inválido/)).toBeVisible()

    await primaryForm.getByLabel('Endereço').fill(VALID_ADDRESS)
    await primaryForm.getByLabel('Rede').selectOption('polygon')
    await primaryForm.getByRole('button', { name: 'Cadastrar carteira' }).click()
    await expect(page.getByTestId('toast')).toContainText('Carteira principal salva')
    await expect(page.getByTestId('wallet-primary-label')).toHaveText('Principal')
    await expect(page.getByTestId('wallet-primary')).toContainText('Polygon')

    const secondaryForm = page.getByTestId('wallet-secondary-form')
    await secondaryForm.getByLabel('Nome da carteira').fill('Reserva')
    await secondaryForm.getByLabel('Endereço').fill(VALID_ADDRESS)
    await secondaryForm.getByRole('button', { name: 'Cadastrar carteira' }).click()
    await expect(
      secondaryForm.getByText('Este endereço já está cadastrado na outra carteira.'),
    ).toBeVisible()

    await secondaryForm.getByLabel('Endereço').fill('0x9f8E7d6C5b4A39281706f5E4d3C2b1A0f9E8d7C6')
    await secondaryForm.getByRole('button', { name: 'Cadastrar carteira' }).click()
    await expect(page.getByTestId('wallet-secondary-label')).toHaveText('Reserva')

    await page.reload()
    await expect(page.getByTestId('wallet-primary-label')).toHaveText('Principal')
    await expect(page.getByTestId('wallet-secondary-label')).toHaveText('Reserva')
  })

  test('edits an existing wallet label and persists it', async ({ app, page }) => {
    await app.goto('/login')
    await app.login()
    await page.goto('/account/wallets')
    await expect(page.getByTestId('wallet-primary-label')).toHaveText('Carteira principal')
    await page.getByTestId('wallet-primary-edit').click()
    const form = page.getByTestId('wallet-primary-form')
    await form.getByLabel('Nome da carteira').fill('Carteira de compras')
    await form.getByRole('button', { name: 'Salvar carteira' }).click()
    await expect(page.getByTestId('wallet-primary-label')).toHaveText('Carteira de compras')
    await page.reload()
    await expect(page.getByTestId('wallet-primary-label')).toHaveText('Carteira de compras')
  })
})
