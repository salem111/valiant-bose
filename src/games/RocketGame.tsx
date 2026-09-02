import React from "react";
import { RocketGame } from "../components/MiniGames/RocketGame";
import { UserProfile } from "../types";

interface RocketGameProps {
  user?: UserProfile;
  onUpdateCoins?: (delta: number) => void;
  onBack?: () => void;
}

export default function RocketGameWrapper({ user, onUpdateCoins, onBack }: RocketGameProps) {
  const dummyUser: UserProfile = user || {
    id: 'guest',
    name: 'المستخدم',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    coins: 50000,
    diamonds: 1000,
    vipRank: 'Gold',
    vipLevel: 5,
    levelStatus: 'ليفل 10',
    isAllowedToCreateRoom: true,
    hasActiveRoom: false,
    followersCount: 120,
    followingCount: 45,
  };

  return (
    <RocketGame
      user={dummyUser}
      onUpdateCoins={onUpdateCoins || (() => {})}
      onBack={onBack}
    />
  );
}

export { RocketGame };
