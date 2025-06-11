const formatDateTime = (dateTimeString: string): string => {
  const dateTime = new Date(dateTimeString);
  const now = new Date();
  const diffMs = now.getTime() - dateTime.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24 && now.getDate() === dateTime.getDate()) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return `Yesterday ${dateTime.getHours()}:${dateTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  } else if (diffDays < 7) {
    const dayName = daysOfWeek[dateTime.getDay()];
    return `${dayName} ${dateTime.getHours()}:${dateTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${dateTime.getDate().toString().padStart(2, "0")}/${(
      dateTime.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${dateTime.getFullYear()}`;
  }
};

export default formatDateTime;
