export type Role = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";
export type Profile = { id:string; discordId:string; name:string; role:Role; avatar:string; };
export type LiveMatch = { id:string; startedAt:string; teams:{name:string; players:Profile[]}[]; };
export type RecentMatch = { id:string; date:string; winner:string; teams:string[]; };
