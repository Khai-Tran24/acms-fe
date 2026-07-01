const CardSection = ({
  data,
}: {
  data: { title: string; value: number; icon: React.ReactNode };
}) => {
  return (
    <div>
      {/* <Card className="flex ">
        <CardHeader>
          <p className="text-xl font-bold">{data.title}</p>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.value}</p>
        </CardContent>
      </Card> */}

      <div className="flex items-center gap-4 rounded-lg bg-white p-4 ring-1 ring-foreground/10">
        <div className="rounded-full bg-blue-100 p-3">{data.icon}</div>
        <div>
          <p className="text-sm text-gray-500">{data.title}</p>
          <p className="text-xl font-bold">{data.value}</p>
        </div>
      </div>
    </div>
  );
};

export default CardSection;
