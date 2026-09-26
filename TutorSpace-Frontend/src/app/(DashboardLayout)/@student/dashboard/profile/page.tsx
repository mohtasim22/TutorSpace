// @student/dashboard/profile/page.tsx
import StudentProfileForm from "@/components/modules/profile/StudentProfileForm";
import { getUser } from "@/services/auth";


export default async function StudentProfilePage() {
  try {
    const user = await getUser();
    if (!user) {
      return <div>Not logged in</div>;
    }

    return <StudentProfileForm user={user} />;
  } catch (error) {
    console.error("Page error:", error);
    return <div>Something went wrong</div>;
  }
}
