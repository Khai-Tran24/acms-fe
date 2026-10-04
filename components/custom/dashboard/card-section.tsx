const CardSection = ({
  data,
}: {
  data: { title: string; value: number; icon: React.ReactNode };
}) => {
  return (
    <div>
      {/* <Card className="flex ">
        <CardHeader>
          <p className="text-2xl font-semibold tabular-nums">{data.title}</p>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.value}</p>
        </CardContent>
      </Card> */}

      <div className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
        <div className="rounded-xl bg-primary/10 text-primary p-3">{data.icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{data.title}</p>
          <p className="text-2xl font-semibold tabular-nums">{data.value}</p>
        </div>
      </div>
    </div>
  );
};

export default CardSection;
