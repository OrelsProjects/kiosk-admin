export const getStartOfDay = (date?: Date) => {
  if (!date) {
    date = new Date();
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};
