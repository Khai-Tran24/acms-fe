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
      <div className="flex items-center gap-4 rounded-lg bg-white p-4 ring-1 ring-foreground/10">
        <div className={`rounded-full p-3 ${data.className}`}>{data.icon}</div>
        <div>
          <p className="text-sm text-gray-500">{data.title}</p>
          <p className="text-xl font-bold">{data.value}</p>
        </div>
      </div>
    </div>
  );
};

export default CardSection;
