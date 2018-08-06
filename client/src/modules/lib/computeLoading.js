export default (currentLoading, key, isLoading) => {
  const newLoading = {
    ...currentLoading,
    sections: {
      ...currentLoading.sections,
      [key]: isLoading,
    },
  };
  const numberOfSections = Object.keys(newLoading.sections).length;
  const step = Math.floor(100 / numberOfSections);
  newLoading.loadingPercent = Object.keys(newLoading.sections).reduce((acc, section) => {
    if (newLoading.sections[section]) return acc - step;
    return acc;
  }, 100);

  return newLoading;
};
