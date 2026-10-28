import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Info } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { parseAuthSearch } from '@/features/auth/auth-search'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { sanitizeRedirect } from '@/features/auth/require-auth'

export const Route = createFileRoute('/login')({
  validateSearch: parseAuthSearch,
  component: LoginPage,
})

const REASON_MESSAGES = {
  expired: 'Sua sessão expirou. Entre novamente para continuar de onde parou.',
  required: 'Faça login para acessar esta área.',
} as const

function LoginPage() {
  const { redirect, reason } = Route.useSearch()
  const navigate = useNavigate()
  const demo = { email: 'ana@example.com', password: 'Senha@123' }

  return (
    <AuthShell
      mode="login"
      title="Entrar"
      description="Entre para gerenciar sua carteira, coleção e perfil de criador."
      redirect={redirect}
      footer={
        <>
          Novo na Kurio?{' '}
          <Link
            to="/register"
            search={{ redirect }}
            className="text-text-accent underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Crie uma conta
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {reason || redirect ? (
          <Alert variant="info" data-testid="login-reason">
            <Info aria-hidden="true" />
            <AlertDescription>{REASON_MESSAGES[reason ?? 'required']}</AlertDescription>
          </Alert>
        ) : null}
        <LoginForm
          onSuccess={() => void navigate({ to: sanitizeRedirect(redirect), replace: true })}
        />
        <p className="text-center text-xs text-muted-foreground" data-testid="demo-credentials">
          Demonstração: <code>{demo.email}</code> / <code>{demo.password}</code>
        </p>
      </div>
    </AuthShell>
  )
}
