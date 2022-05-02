import { atom } from "recoil";

export const isLoggedInAtom = atom({
  key: "isLoggedIn",
  default: localStorage.getItem("access_token") ? true : false,
});

export const userIdAtom = atom({
  key: "userId",
  default: "",
});

export const accessTokenAtom = atom({
  key: "accessToken",
  default: "",
});

export const regionAtom = atom({
  key: "region",
  default: "",
});
