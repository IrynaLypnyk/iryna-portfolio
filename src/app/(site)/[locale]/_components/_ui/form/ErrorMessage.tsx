export function ErrorMessage({ message }: { message: string }) {
  return <span className="text-app-danger pt-1 font-sans text-xs tracking-wide">{message}</span>;
}
