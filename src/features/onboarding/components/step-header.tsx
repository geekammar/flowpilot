export function StepHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
      <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
