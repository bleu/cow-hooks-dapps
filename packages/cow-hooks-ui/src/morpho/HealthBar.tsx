export const HealthBar = ({ health }: { health: number }) => {
  return (
    <div className="rounded-md p-[1px] h-3 bg-color-paper">
      <div
        className="rounded-md h-full bg-primary"
        style={{ width: `${Math.min(health, 100)}%` }}
      />
    </div>
  );
};
