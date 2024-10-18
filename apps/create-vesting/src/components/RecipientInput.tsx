import { Input } from "@bleu/cow-hooks-ui";

export const RecipientInput = () => {
  return (
    <Input
      name="recipient"
      label="Vesting Recipient"
      placeholder="Address or ENS name"
      autoComplete="off"
      className="h-12 p-2.5 rounded-xl bg-color-paper-darker border-none"
    />
  );
};
