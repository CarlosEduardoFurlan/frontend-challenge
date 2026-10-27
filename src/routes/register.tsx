import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { parseAuthSearch } from '@/features/auth/auth-search'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
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
    <AuthLayout
      title="Criar conta"
      description="Leva menos de um minuto. Nenhum dado real é necessário."
      footer={
        <>
          Já tem conta?{' '}
          <Link
            to="/login"
            search={{ redirect }}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Entrar
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
    </AuthLayout>
  )
}
