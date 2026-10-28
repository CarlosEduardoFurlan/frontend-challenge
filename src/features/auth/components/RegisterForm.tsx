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

import { applyApiErrors } from '../apply-api-errors'
import { useRegister } from '../hooks'
import { registerSchema, type RegisterInput } from '../schemas'
import { AUTH_BUTTON_CLASS, AUTH_FIELD_CLASS } from './LoginForm'
import { PasswordInput } from './PasswordInput'

interface RegisterFormProps {
  onSuccess: () => void
}

/** Figma register fields (placeholder-only): name, e-mail, password, confirmation, "Criar conta". */
export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const register = useRegister()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  })

  async function onSubmit(values: RegisterInput) {
    setFormError(null)
    try {
      await register.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      onSuccess()
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, ['name', 'email', 'password']))
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
        data-testid="register-form"
      >
        {formError ? (
          <Alert variant="destructive" data-testid="form-error">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Nome completo</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  placeholder="Nome completo"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Digite seu e-mail"
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
                  autoComplete="new-password"
                  placeholder="Senha (mínimo de 8 caracteres)"
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Confirmar senha</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Confirmar senha"
                  className={AUTH_FIELD_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className={AUTH_BUTTON_CLASS} loading={register.isPending}>
          Criar conta
        </Button>
      </form>
    </Form>
  )
}
