import { useSession } from "@/app/context/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { memo } from "react";

export const ProfileInfo = memo(() => {
  const { user } = useSession();

  return (
    <div className="bg-[#16161d] rounded-2xl p-6 border border-[#00f0ff]/20 neon-glow">
      <div className="flex items-center gap-4">
        <Avatar size="lg" className='w-14! h-14!'>
          <AvatarImage src={user?.photo_url} />
          <AvatarFallback>{user?.first_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl text-white mb-1">{user?.first_name} {user?.last_name}</h2>
          <p className="text-gray-400">@{user?.username}</p>
        </div>
      </div>
    </div>
  );
});