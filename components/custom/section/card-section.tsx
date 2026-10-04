const CardSection = ({
  data,
}: {
  data: {
    title: string;
    value: number;
    icon: React.ReactNode;
    className: string;
  };
}) => {
  return (
    <div>
      <div className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
        <div className={`rounded-full p-3 ${data.className}`}>{data.icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{data.title}</p>
          <p className="text-2xl font-semibold tabular-nums">{data.value}</p>
        </div>
      </div>
    </div>
  );
};

export default CardSection;
