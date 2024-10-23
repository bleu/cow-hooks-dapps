import { Input } from "@bleu/cow-hooks-ui";
import { useFormContext } from "react-hook-form";
//import { useState } from "react";

export const RecipientInput = () => {
  const { setValue } = useFormContext();
  // This commented code implements the recipient input trim on overflow
  // We will keep to use in case of feedbacks about the overflow
  //export const RecipientInput = ({ value }: { value: string }) => {
  // const [displayValue, setDisplayValue] = useState(value);
  // const [isOnFocus, setIsOnFocus] = useState(false);

  // const getIsOverflowing = () => {
  //   const recipientInput = document.getElementById("recipient");
  //   const { scrollWidth, clientWidth } = recipientInput ?? {
  //     scrollWidth: 0,
  //     clientWidth: 0,
  //   };
  //   const isOverflowing = scrollWidth > clientWidth;
  //   return isOverflowing;
  // };

  // const getFormattedValue = () => {
  //   return getIsOverflowing()
  //     ? `${value.slice(0, 6)}...${value.slice(-4)}`
  //     : value;
  // };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newValue = e.target.value.trim();
  //   setDisplayValue(newValue);
  // };

  // const handleBlur = () => {
  //   setIsOnFocus(false);
  //   setDisplayValue(getFormattedValue());
  // };

  // const handleFocus = () => {
  //   setIsOnFocus(true);
  //   setDisplayValue(value);
  // };

  return (
    <Input
      id="recipient"
      name="recipient"
      label="Vesting Recipient"
      placeholder="Address or ENS name"
      autoComplete="off"
      className="h-12 p-2.5 rounded-xl bg-color-paper-darker border-none"
      // validation={{
      //   onChange: handleChange,
      //   onBlur: handleBlur,
      // }}
      // onFocus={handleFocus}
      // value={
      //   !isOnFocus && getIsOverflowing() ? getFormattedValue() : displayValue
      // }
      validation={{
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          setValue("recipient", e.target.value.trim());
        },
      }}
    />
  );
};
