function toDateOnly(str) {
  if (!str) return null;
  const s = String(str).trim();
  if (s.length >= 10) return s.slice(0, 10);
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export const getDateRangeStrings = (checkIn, checkOut) => {
  const startStr = toDateOnly(checkIn);
  const endStr = toDateOnly(checkOut);
  if (!startStr || !endStr) return [];
  const start = new Date(startStr + "T00:00:00.000Z");
  const end = new Date(endStr + "T00:00:00.000Z");
  const dates = [];
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
};

export const getTodayDateString = () => {
  return new Date().toISOString().slice(0, 10);
};

/** Add n days to YYYY-MM-DD string; returns YYYY-MM-DD */
export const addDays = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};