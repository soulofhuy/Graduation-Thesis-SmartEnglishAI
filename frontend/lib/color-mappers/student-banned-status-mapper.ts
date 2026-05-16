export const getStudentBannedStatusColor = (isBanned: boolean) => {
  return isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
};
