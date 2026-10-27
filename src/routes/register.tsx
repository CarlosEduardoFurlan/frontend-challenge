import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { sanitizeRedirect } from '@/features/auth/require-auth'
import { toast } from '@/hooks/use-toast'

const registerSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/register')({
  validateSearch: registerSearchSchema,
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
