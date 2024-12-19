import { useAtomValue } from "jotai";
import { selectedPoolAtom } from "#/app/states/selectedPool";

export function useSelectedPool() {
  return useAtomValue(selectedPoolAtom);
}
