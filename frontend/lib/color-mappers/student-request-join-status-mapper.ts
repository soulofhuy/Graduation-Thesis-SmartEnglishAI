export const getStudentRequestJoinStatusColor = (status: string) => {
  const newStatus = status.toLowerCase();
  switch (newStatus) {
    case 'pending':
      return 'bg-warning/10 text-warning';
    case 'approved':
      return 'bg-success/10 text-success';
    case 'rejected':
      return 'bg-accent/10 text-accent';
    default:
      return 'bg-muted text-muted-foreground';
  }
};
