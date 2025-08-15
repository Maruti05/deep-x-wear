import RoleGuard from '@/components/common/RoleGuard';
import React, { Children } from 'react'

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
    <div>
      {children}
    </div>
    </RoleGuard>
  )
}

export default layout
