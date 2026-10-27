import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { applyApiErrors } from '@/features/auth/apply-api-errors'
import { initials } from '@/lib/format'
import type { User } from '@/types/api'

import { fileToAvatarDataUrl } from '../avatar'
import { useUpdateProfile } from '../hooks'
import { updateProfileSchema, type UpdateProfileInput } from '../schemas'

export function ProfileForm({ user }: { user: User }) {
  const update = useUpdateProfile()
  const fileRef = useRef<HTMLInputElement>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    },
    mode: 'onTouched',
  })
  const avatarUrl = form.watch('avatarUrl')
  const name = form.watch('name')

  async function onFileChange(file: File | undefined) {
    if (!file) return
    setAvatarError(null)
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      form.setValue('avatarUrl', dataUrl, { shouldDirty: true, shouldValidate: true })
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Não foi possível ler a imagem.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function onSubmit(values: UpdateProfileInput) {
    setFormError(null)
    try {
      const saved = await update.mutateAsync(values)
      form.reset({
        name: saved.name,
        username: saved.username,
        bio: saved.bio,
        avatarUrl: saved.avatarUrl,
      })
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, ['name', 'username', 'bio', 'avatarUrl']))
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
        data-testid="profile-form"
      >
        {formError ? (
          <Alert variant="destructive" data-testid="form-error">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-20">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" data-testid="avatar-preview" /> : null}
            <AvatarFallback className="text-xl">{initials(name || user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Avatar</p>
            <div className="flex flex-wrap gap-2">
              <label htmlFor="avatar-file" className="sr-only">
                Arquivo do avatar
              </label>
              <input
                ref={fileRef}
                id="avatar-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => void onFileChange(event.target.files?.[0])}
                aria-describedby="avatar-hint"
                data-testid="avatar-input"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <Upload aria-hidden="true" /> Enviar imagem
              </Button>
              {avatarUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => form.setValue('avatarUrl', null, { shouldDirty: true })}
                  data-testid="avatar-remove"
                >
                  <Trash2 aria-hidden="true" /> Remover
                </Button>
              ) : null}
            </div>
            <p id="avatar-hint" className="text-xs text-muted-foreground">
              PNG, JPEG ou WebP. A imagem é recortada em quadrado e reduzida para 256 px.
            </p>
            {avatarError ? (
              <p role="alert" className="text-xs text-destructive">
                {avatarError}
              </p>
            ) : null}
            <FormField
              control={form.control}
              name="avatarUrl"
              render={() => (
                <FormItem className="gap-0">
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome de usuário</FormLabel>
                <FormControl>
                  <Input autoComplete="username" autoCapitalize="none" {...field} />
                </FormControl>
                <FormDescription>Letras minúsculas, números, ponto e sublinhado.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea rows={3} maxLength={280} {...field} />
              </FormControl>
              <FormDescription>{field.value.length}/280 caracteres.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-1 text-sm">
          <span className="font-medium">E-mail</span>
          <span className="text-muted-foreground">{user.email}</span>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" loading={update.isPending} disabled={!form.formState.isDirty}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </Form>
  )
}
