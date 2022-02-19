export const formatDate = (date) => {
  let dan = date.getDate();
  let mjesec = date.getMonth() + 1;
  let godina = date.getFullYear();

  if (String(dan).length == 1) {
    dan = "0" + dan;
  }
  if (String(mjesec).length == 1) {
    mjesec = "0" + mjesec;
  }

  return godina + "/" + mjesec + "/" + dan;
};

export const formatDateDisplay = (date) => {
  const datum = date.split("/");

  return datum[2] + "." + datum[1] + "." + datum[0];
};
