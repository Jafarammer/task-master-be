const expiredTask = (endDate: Date, isCompleted: boolean) => {
  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  return !isCompleted && new Date() > endOfDay;
};

export default expiredTask;
