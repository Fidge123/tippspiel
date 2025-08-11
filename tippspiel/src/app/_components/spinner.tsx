export default function Spinner() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-current border-r-transparent border-solid align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    </div>
  );
}
