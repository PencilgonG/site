// Rôles DB -> libellés UI
export type UiRole = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT" | "SUB";

export function toUiRole(db: "TOP" | "JGL" | "MID" | "ADC" | "SUPP" | "SUB"): UiRole {
  switch (db) {
    case "JGL":
      return "JUNGLE";
    case "SUPP":
      return "SUPPORT";
    default:
      return db as UiRole;
  }
}
