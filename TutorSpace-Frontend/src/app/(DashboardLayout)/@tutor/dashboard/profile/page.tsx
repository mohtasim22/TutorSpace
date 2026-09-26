import TutorProfileForm from "@/components/modules/profile/TutorProfileForm";
import { getUser } from "@/services/auth";
import { getTutorProfile } from "@/services/tutor";

export default async function TutorProfilePage() {
    const user = await getUser();
    const {tutor} = await getTutorProfile({userId: user?.id as string});
    
  return <TutorProfileForm user={user} tutor={tutor} />;
}