import AdminUsersPage from "@/components/modules/admin/AdminUsersPage"
import { getAllUsers } from "@/services/admin"

export default async function UsersPage() {
  const users = await getAllUsers()

  return <AdminUsersPage initialUsers={users ?? []} />
}