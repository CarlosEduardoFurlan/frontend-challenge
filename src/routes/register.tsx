import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { parseAuthSearch } from '@/features/auth/auth-search'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { sanitizeRedirect } from '@/features/auth/require-auth'
import { toast } from '@/hooks/use-toast'

export const Route = createFileRoute('/register')({
  validateSearch: parseAuthSearch,
  component: RegisterPage,
})

function RegisterPage() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()

  return (
    <AuthShell
      mode="register"
      title="Criar perfil de colecionador"
      description="Crie seu perfil de colecionador e conecte uma carteira quando quiser."
      redirect={redirect}
      footer={
        <>
          Já tem uma conta?{' '}
          <Link
            to="/login"
            search={{ redirect }}
            className="text-text-accent underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Entre
          </Link>
        </>
      }
    >
      <RegisterForm
        onSuccess={() => {
          toast({
            title: 'Conta criada',
            description: 'Você já está conectado.',
            variant: 'success',
          })
          void navigate({ to: sanitizeRedirect(redirect), replace: true })
        }}
      />
    </AuthShell>
  )
}
