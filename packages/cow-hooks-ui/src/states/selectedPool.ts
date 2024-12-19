import { atom } from "jotai";
import { IPool } from "../types";

export const selectedPoolAtom = atom<IPool | undefined>();
