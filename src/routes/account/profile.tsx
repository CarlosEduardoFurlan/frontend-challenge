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
 * "Desktop / Perfil do colecionador" (9:1238): 16px bold section titles, a two-column form with
 * the avatar row and a narrow single-column "Alterar senha" block.
 */
function ProfilePage() {
  const profile = useProfile()

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <h1 className="text-base leading-tight font-bold">Perfil do colecionador</h1>
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
        <h2 className="text-base leading-tight font-bold">Alterar senha</h2>
        <PasswordForm />
      </section>
    </div>
  )
}
