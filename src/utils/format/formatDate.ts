/**
 *
 * @param dateString - Tanggal dalam format "YYYY-MM-DDTHH:mm:ss.000Z"
 * @returns String dengan format "Dayname, DD MMMM YYYY"
 */
const formatDate = (dateString?: string | Date): string => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  if (!dateString || isNaN(Date.parse(dateString.toString()))) {
    return "";
  }
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  const dayName = days[date.getUTCDay()];
  const day = date.getUTCDate();
  const monthName = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
};

export default formatDate;
