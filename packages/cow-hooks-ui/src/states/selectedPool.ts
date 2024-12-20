import { atom } from "jotai";
import type { IPool } from "../types";

export const selectedPoolAtom = atom<IPool | undefined>();
