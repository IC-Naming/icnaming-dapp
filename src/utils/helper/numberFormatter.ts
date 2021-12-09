export const numberFormat = (
  number: bigint | number | string,
  decimals?: number,
  dec_point?: string,
  thousands_sep?: string
) => {
  decimals = decimals || 4;
  number = (number + "").replace(/[^0-9+-Ee.]/g, "");
  const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
  const sep = thousands_sep || ",";
  let bigPart = number;
  let smallPart = "";
  if (number.indexOf(".") > 0) {
    const numberParts = number.split(".");
    bigPart = numberParts[0];
    smallPart = numberParts[1];
  }

  const toFixedFix = (n, prec) => {
    let k = Math.pow(10, prec);
    return "" + Math.ceil(n * k) / k;
  };
  const re = /(-?\d+)(\d{3})/;
  while (re.test(bigPart)) {
    bigPart = bigPart.replace(re, "$1" + sep + "$2");
  }
  if (smallPart) {
    smallPart = toFixedFix("0." + smallPart, prec);
    smallPart = smallPart.split(".")[1];
  }
  if (smallPart) return bigPart + "." + smallPart;
  else return bigPart;
};