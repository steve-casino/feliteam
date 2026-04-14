import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm font-semibold text-purple-400">404</p>
        <h1 className="text-3xl font-bold text-white">Page not found</h1>
        <p className="text-white/60">
          The page you were looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-4 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
