export const DEFAULT_PERMIT_DURATION = 157784760000;

export function getPermitDeadline() {
  return Math.ceil((Date.now() + DEFAULT_PERMIT_DURATION) / 1000);
}
