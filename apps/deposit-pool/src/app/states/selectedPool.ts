import type { IPool } from "@bleu/cow-hooks-ui";
import { atom } from "jotai";

// Types
export const selectedPoolAtom = atom<IPool | undefined>();
