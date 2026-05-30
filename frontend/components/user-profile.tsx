import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getRoleColor } from '@/lib/color-mappers/user-role-mapper'
import { cn } from '@/lib/utils'
import { useLanguage } from './language-provider'
import { getRoleLabel } from '@/lib/language-mappers/user-role-mapper'

interface UserProfileProps {
  name: string
  role: string
  avatar?: string
}

export function UserProfile({ name, role, avatar }: UserProfileProps) {
  const { language } = useLanguage()
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border border-white/20 dark:border-white/10">
      <Avatar className="h-10 w-10 border-2 border-white/50">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className={cn('bg-gradient-to-br from-sky-500 to-indigo-500 text-white font-bold', 'dark:from-sky-600 dark:to-indigo-600')}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
        <Badge variant="outline" className={cn('text-xs mt-1 border', getRoleColor(role))}>
          {getRoleLabel(role, language)}
        </Badge>
      </div>
    </div>
  )
}
