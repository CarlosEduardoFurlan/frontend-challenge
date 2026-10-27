import { createFileRoute } from '@tanstack/react-router'

import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { PasswordForm } from '@/features/profile/components/PasswordForm'
import { ProfileForm } from '@/features/profile/components/ProfileForm'
import { useProfile } from '@/features/profile/hooks'

export const Route = createFileRoute('/account/profile')({
  component: ProfilePage,
})

/**
 * Profile screen in the account shell. The Figma frame for this screen (9:1238) could not be
 * fetched (MCP rate limit); the layout mirrors the Carteiras frame: 20px bold title, 14px
 * description and a two-column form.
 */
function ProfilePage() {
  const profile = useProfile()

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl leading-tight font-bold">Dados do perfil</h1>
          <p className="text-sm text-muted-foreground">
            Nome, nome de usuário, bio e avatar exibidos na sua conta.
          </p>
        </div>
        {profile.isPending ? (
          <div className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando perfil">
            <div className="flex items-center gap-4">
              <Skeleton className="size-20 rounded-full" />
              <Skeleton className="h-8 w-40" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        ) : profile.isError ? (
          <ErrorState
            error={profile.error}
            onRetry={() => void profile.refetch()}
            retrying={profile.isFetching}
          />
        ) : (
          <ProfileForm key={profile.data.id} user={profile.data} />
        )}
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl leading-tight font-bold">Alterar senha</h2>
          <p className="text-sm text-muted-foreground">
            Confirme a senha atual para definir uma nova.
          </p>
        </div>
        <PasswordForm />
      </section>
    </div>
  )
}
