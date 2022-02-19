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

export const getDate = (unixTimestamp) => {
  let date = new Date(unixTimestamp * 1000);
  let dan = date.getDate();
  let mjesec = date.getMonth() + 1;
  let godina = date.getFullYear();
  if (String(dan).length == 1) {
    dan = "0" + dan;
  }
  if (String(mjesec).length == 1) {
    mjesec = "0" + mjesec;
  }
  return dan + "." + mjesec + "." + godina;
};
export const getDateAndTime = (unixTimestamp) => {
  let date = new Date(unixTimestamp * 1000);
  let dan = date.getDate();
  let mjesec = date.getMonth() + 1;
  let godina = date.getFullYear();
  let sati = date.getHours();
  let minute = date.getMinutes();
  if (String(dan).length == 1) {
    dan = "0" + dan;
  }
  if (String(mjesec).length == 1) {
    mjesec = "0" + mjesec;
  }
  if (String(minute).length == 1) {
    minute = "0" + minute;
  }
  return dan + "." + mjesec + "." + godina + " " + sati + ":" + minute;
};
