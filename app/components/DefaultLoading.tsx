export default function DefaultLoading(
  { title }: { title: string } = { title: 'Loading...' }
) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">{title}</div>
    </div>
  );
}
