import { useAuthStore } from "@/store/useAuthStore";

export default function Layout({
  vendor,
  admin,
  institution,
  individual,
  children
}: {
  vendor: React.ReactNode
  admin: React.ReactNode
  institution: React.ReactNode
  individual: React.ReactNode
  children: React.ReactNode
}) {
  const { userType } = useAuthStore();
  return (
    <>
      userType === 'individual' ? individual : userType === 'institution' ? institution : userType === 'vendor' ? vendor : userType === 'admin' ? admin : <div>Unauthorized</div>
      {children}
    </>
  )
}