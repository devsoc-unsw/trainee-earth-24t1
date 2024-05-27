/**
 * Convert a date to date time string format (a simplified version of the
 * ISO 8601 calendar date extended format) that includes local timezone info.
 *
 * Date time string format: YYYY-MM-DDTHH:mm:ss.sssZ
 * where the Z represents the local timezone offset e.g. "+10:00", "-10:00"
 * to mean 10 hours ahead or behind UTC time respectively.
 *
 * Example:
 * const date = new Date("2024-05-21T18:23:42.555T+10:00");
 * console.log(toIsoStringWithTimezone(date)); // "2024-05-21T18:23:42.555+10:00");
 *
 * This format can be parsed into a Date object using the Date constructor.
 * const date = new Date("2024-05-21T18:23:42.555+10:00");
 *
 * Also can be parsed with the Date.parse method.
 * const date = Date.parse("2024-05-21T18:23:42.555+10:00");
 */
export function toIsoStringWithTimezone(date: Date): string {
  var tzo = -date.getTimezoneOffset(),
    dif = tzo >= 0 ? "+" : "-",
    pad = function (num) {
      return (num < 10 ? "0" : "") + num;
    };

  return (
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    date.getDate().toString().padStart(2, "0") +
    "T" +
    date.getHours().toString().padStart(2, "0") +
    ":" +
    date.getMinutes().toString().padStart(2, "0") +
    ":" +
    date.getSeconds().toString().padStart(2, "0") +
    "." +
    date.getMilliseconds().toString().padStart(3, "0") +
    dif +
    Math.floor(Math.abs(tzo) / 60) +
    ":" +
    (Math.abs(tzo) % 60)
  );
}
