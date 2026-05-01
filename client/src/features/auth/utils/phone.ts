export const countryCodes = [
  { label: "India", code: "+91" },
  { label: "United States", code: "+1" },
  { label: "United Kingdom", code: "+44" },
  { label: "United Arab Emirates", code: "+971" },
  { label: "Singapore", code: "+65" },
];

export const splitPhone = (phone?: string | null) => {
  const match = countryCodes.find(
    (country) => phone?.startsWith(country.code)
  );

  if (!phone || !match) {
    return {
      countryCode: "+91",
      phoneNumber: phone?.replace(/\D/g, "") ?? "",
    };
  }

  return {
    countryCode: match.code,
    phoneNumber: phone.slice(match.code.length).replace(/\D/g, ""),
  };
};

export const normalizePhone = (countryCode: string, phoneNumber: string) => {
  const digits = phoneNumber.replace(/\D/g, "");

  return digits ? `${countryCode}${digits}` : undefined;
};
