import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { applyApiErrors } from '@/features/auth/apply-api-errors'
import { initials } from '@/lib/format'
import type { User } from '@/types/api'

import { fileToAvatarDataUrl } from '../avatar'
import { useUpdateProfile } from '../hooks'
import { updateProfileSchema, type UpdateProfileInput } from '../schemas'

/**
 * "Desktop / Perfil do colecionador" (9:1238): two-column form (labels with asterisks, bordered
 * fields), the e-mail as a read-only field, the "Avatar" row with a small round preview, the
 * "Alterar" button and the "Remover" link, then the save button on the left.
 */
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

        <div className="grid gap-x-7 gap-y-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Nome completo</FormLabel>
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
                <FormLabel required>Nome de usuário</FormLabel>
                <FormControl>
                  <Input autoComplete="username" autoCapitalize="none" {...field} />
                </FormControl>
                <FormDescription>Letras minúsculas, números, ponto e sublinhado.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-2">
            <Label htmlFor="profile-email" required>
              E-mail
            </Label>
            <Input id="profile-email" value={user.email} readOnly disabled />
          </div>
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="sm:row-span-2">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea rows={4} maxLength={280} {...field} />
                </FormControl>
                <FormDescription>{field.value.length}/280 caracteres.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-2">
            <p className="text-[15px] leading-none">Avatar</p>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="size-9">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="" data-testid="avatar-preview" />
                ) : null}
                <AvatarFallback className="text-xs">{initials(name || user.name)}</AvatarFallback>
              </Avatar>
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
                size="sm"
                className="text-sm"
                onClick={() => fileRef.current?.click()}
              >
                Alterar
              </Button>
              {avatarUrl ? (
                <button
                  type="button"
                  className="cursor-pointer text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => form.setValue('avatarUrl', null, { shouldDirty: true })}
                  data-testid="avatar-remove"
                >
                  Remover
                </button>
              ) : null}
            </div>
            <p id="avatar-hint" className="text-xs text-muted-foreground">
              PNG, JPEG ou WebP; recortado em quadrado e reduzido para 256 px.
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

        <div className="flex">
          <Button type="submit" loading={update.isPending} disabled={!form.formState.isDirty}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </Form>
  )
}
