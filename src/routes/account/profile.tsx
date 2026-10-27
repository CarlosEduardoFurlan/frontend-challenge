import { createFileRoute } from '@tanstack/react-router'

import { ErrorState } from '@/components/shared/ErrorState'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PasswordForm } from '@/features/profile/components/PasswordForm'
import { ProfileForm } from '@/features/profile/components/ProfileForm'
import { useProfile } from '@/features/profile/hooks'

export const Route = createFileRoute('/account/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const profile = useProfile()

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        as="h1"
        title="Perfil do colecionador"
        description="Seus dados públicos e credenciais."
      />

      <Card>
        <CardHeader>
          <CardTitle>Dados do perfil</CardTitle>
          <CardDescription>Nome, nome de usuário, bio e avatar.</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.isPending ? (
            <div className="flex flex-col gap-5" aria-busy="true" aria-label="Carregando perfil">
              <div className="flex items-center gap-4">
                <Skeleton className="size-20 rounded-full" />
                <Skeleton className="h-8 w-40" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
          <CardDescription>Confirme a senha atual para definir uma nova.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
