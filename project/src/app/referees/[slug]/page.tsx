export default function RefereeProfilePage({ params }: { params: { slug: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Referee Profile</h1>
      <p className="text-muted-foreground">Profile for: {params.slug}</p>
    </div>
  );
}
