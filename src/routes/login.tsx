import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Info } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { parseAuthSearch } from '@/features/auth/auth-search'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
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
    <AuthLayout
      title="Entrar"
      description="Acesse sua conta para favoritar, comprar e gerenciar carteiras."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link
            to="/register"
            search={{ redirect }}
            className="font-bold text-text-accent underline-offset-4 hover:underline"
          >
            Criar conta
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
        {demo ? (
          <p className="text-center text-xs text-muted-foreground" data-testid="demo-credentials">
            Demonstração: <code>{demo.email}</code> / <code>{demo.password}</code>
          </p>
        ) : null}
      </div>
    </AuthLayout>
  )
}
