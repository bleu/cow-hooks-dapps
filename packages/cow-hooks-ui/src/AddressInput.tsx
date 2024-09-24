import clsx from "clsx";

const Label = ({ label }: { label: string }) => (
  <div className="w-fit ml-2 my-2.5">
    <label className="text-sm">{label}</label>
  </div>
);

export const AddressInput = ({
  theme,
  label,
  onChange,
  ...props
}: {
  theme: string;
  label: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col w-full">
    <Label label={label} />
    <input
      type="text"
      placeholder="0xabc..."
      onChange={onChange}
      className={clsx(
        "w-full mt-0 p-2.5 rounded-xl outline-none text-color-text-paper border-2 border-color-border focus:border-primary",
        { "bg-color-paper-darker": theme === "dark" },
        { "bg-color-paper": theme === "light" }
      )}
      {...props}
    />
  </div>
);
