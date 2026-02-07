import { useSession } from "@/app/context/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { memo } from "react";

export const ProfileInfo = memo(() => {
  const { user, profile } = useSession();

  // Telegram initDataUnsafe → primary, profile из БД → fallback
  const photoUrl = user?.photo_url || profile?.avatar_url;
  const firstName = user?.first_name || profile?.first_name || "";
  const lastName = user?.last_name || "";
  const username = user?.username || profile?.username;
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || username || "—";

  return (
    <div className="bg-[#16161d] rounded-2xl p-6 border border-[#00f0ff]/20 neon-glow">
      <div className="flex items-center gap-4">
        <Avatar size="lg" className='w-14! h-14!'>
          <AvatarImage src={photoUrl} />
          <AvatarFallback>{firstName.charAt(0) || "?"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl text-white mb-1">{displayName}</h2>
          {username && <p className="text-gray-400">@{username}</p>}
        </div>
      </div>
    </div>
  );
});