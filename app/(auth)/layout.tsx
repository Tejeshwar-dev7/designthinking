// Auth pages get their own layout — no NavBar, no chrome
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
