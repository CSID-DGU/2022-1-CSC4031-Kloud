export function Card({ content }: { itemId: number; content: JSX.Element }) {
  return (
    <div role="button" tabIndex={0} className="card">
      {content}
    </div>
  );
}
