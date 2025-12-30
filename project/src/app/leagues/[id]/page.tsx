export default function LeagueDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">League Details</h1>
      <p className="text-muted-foreground">League ID: {params.id}</p>
    </div>
  );
}
