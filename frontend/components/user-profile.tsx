import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UserProfileProps {
  name: string
  role: 'admin' | 'teacher' | 'student'
  avatar?: string
}

const roleConfig = {
  admin: {
    label: 'Quản trị viên',
    gradient: 'from-destructive to-red-500',
    lightBg: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  teacher: {
    label: 'Giáo viên',
    gradient: 'from-primary to-secondary',
    lightBg: 'bg-primary/10 text-primary border-primary/20',
  },
  student: {
    label: 'Học sinh',
    gradient: 'from-accent to-pink-500',
    lightBg: 'bg-accent/10 text-accent border-accent/20',
  },
}

export function UserProfile({ name, role, avatar }: UserProfileProps) {
  const roleInfo = roleConfig[role]
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
        <AvatarFallback className={`bg-gradient-to-br ${roleInfo.gradient} text-white font-bold`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
        <Badge
          variant="outline"
          className={cn(
            'text-xs mt-1 border',
            roleInfo.lightBg
          )}
        >
          {roleInfo.label}
        </Badge>
      </div>
    </div>
  )
}
