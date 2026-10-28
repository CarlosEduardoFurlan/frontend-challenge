import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

import { applyApiErrors } from '../apply-api-errors'
import { useLogin } from '../hooks'
import { loginSchema, type LoginInput } from '../schemas'
import { PasswordInput } from './PasswordInput'

interface LoginFormProps {
  onSuccess: () => void
}

/** Figma login fields: placeholder-only inputs (labels are visually hidden), "Esqueceu a senha?" and the primary button. */
export const AUTH_FIELD_CLASS = 'h-[50px] rounded-xl text-lg lg:h-10 lg:rounded-md lg:text-sm'
export const AUTH_BUTTON_CLASS =
  'h-[60px] w-full rounded-xl text-xl lg:h-10 lg:rounded-md lg:text-lg'

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  })

  async function onSubmit(values: LoginInput) {
    setFormError(null)
    try {
      await login.mutateAsync(values)
      onSuccess()
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, ['email', 'password']))
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
        data-testid="login-form"
      >
        {formError ? (
          <Alert variant="destructive" data-testid="form-error">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="contato@email.com"
                  className={AUTH_FIELD_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Senha</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="current-password"
                  placeholder="Senha"
                  className={AUTH_FIELD_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="button"
          onClick={() =>
            toast({
              title: 'Recuperação de senha indisponível',
              description: 'Fora do escopo desta demonstração. Use as credenciais de teste.',
              variant: 'info',
            })
          }
          className="-mt-1 cursor-pointer self-end text-lg text-text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring lg:text-sm"
        >
          Esqueceu a senha?
        </button>

        <Button type="submit" className={AUTH_BUTTON_CLASS} loading={login.isPending}>
          Entrar
        </Button>
      </form>
    </Form>
  )
}
