import { useAtomValue } from "jotai";
import { selectedPoolAtom } from "../states";

export function useSelectedPool() {
  return useAtomValue(selectedPoolAtom);
}
