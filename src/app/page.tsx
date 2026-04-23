import { redirect } from 'next/navigation'

export default function Home() {
  // Dashboard is temporarily disabled — land on Intake instead.
  redirect('/intake')
}
