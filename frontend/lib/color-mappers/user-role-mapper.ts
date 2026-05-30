export const getRoleColor = (role: string) => {
  const newRole = role.toLowerCase();
  switch (newRole) {
    case 'teacher':
      return 'bg-primary/10 text-primary';
    case 'student':
      return 'bg-accent/10 text-accent';
    case 'admin':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
};
