export const mutablyDeleteItemFromArray = <T>(data: T[], item: T): T[] => {
  if (!data.length) return data;
  const itemIndex = data.indexOf(item);

  if (itemIndex !== -1) {
    data.splice(itemIndex, 1);
  }

  return data;
};

export const mutablyDeleteItemsFromArray = <T>(data: T[], items: T[]): T[] => {
  if (!data.length || !items.length) return data;
  items.forEach(item => {
    mutablyDeleteItemFromArray(data, item);
  });

  return data;
};
