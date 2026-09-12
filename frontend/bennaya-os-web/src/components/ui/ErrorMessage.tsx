export function ErrorMessage({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
      {message}
    </p>
  )
}
