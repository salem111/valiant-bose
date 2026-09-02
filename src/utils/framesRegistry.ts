import { AvatarFrame } from '../types';
import { InventoryItem } from '../components/backpack/BackpackModal';

// Auto-discover all image files placed inside public/assets/frames/
// This Vite glob will automatically detect ANY new png/webp/svg/jpg/gif file added to the folder!
const frameAssetFiles = import.meta.glob<{ default: string }>(
  ['../../public/assets/frames/*.{png,webp,svg,jpg,jpeg,gif}', '../../public/assets/frames/*'],
  { eager: true, query: '?url', import: 'default' }
);

export interface DynamicFrame {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  priceCoins: number;
  vipLevelRequired: number;
  isUnlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

// Helper to format clean human Arabic names from filenames
function formatFrameName(filename: string): string {
  const cleanName = filename.replace(/\.(png|webp|svg|jpg|jpeg|gif)$/i, '');
  
  if (cleanName === 'frame_01') return 'إطار الأسطورة الملكي 01 👑💎';
  if (cleanName === 'frame_02') return 'إطار التاج الإمبراطوري 02 👑✨';
  if (cleanName === 'frame_03') return 'إطار أجنحة العنقاء الملكية 03 🦅🔥';
  if (cleanName === 'frame_04') return 'إطار ماسة الأميرة الوردية 04 💎🌸';
  if (cleanName === 'frame_05') return 'إطار درع التنين الأسطوري 05 🐉⚔️';

  // Format custom names like "royal_gold" -> "إطار Royal Gold الملكي"
  const formatted = cleanName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
    
  return `إطار ${formatted} الملكي 👑`;
}

// Generate the dynamic list of frames
export function getDiscoveredFrames(): DynamicFrame[] {
  const discovered: DynamicFrame[] = [];
  const entries = Object.entries(frameAssetFiles);

  for (const [filepath] of entries) {
    // Extract filename from path like "/public/assets/frames/frame_01.png"
    const filename = filepath.split('/').pop() || '';
    if (!filename || filename.toLowerCase() === 'readme.md' || filename.startsWith('.')) continue;

    // Public URL served by Vite is "/assets/frames/<filename>"
    const publicUrl = `/assets/frames/${filename}`;
    const id = filename.replace(/\.[^/.]+$/, '');

    discovered.push({
      id,
      name: formatFrameName(filename),
      imageUrl: publicUrl,
      description: `إطار مخصص فاخر مكتشف تلقائياً من المجلد (${filename})، مصمم لغرف سليم الملكية.`,
      priceCoins: 5000,
      vipLevelRequired: 1,
      isUnlocked: true,
      rarity: 'legendary',
    });
  }

  // Fallback if glob hasn't triggered or during initial load
  if (discovered.length === 0) {
    discovered.push({
      id: 'frame_01',
      name: 'إطار الأسطورة الملكي 01 👑💎',
      imageUrl: '/assets/frames/frame_01.png',
      description: 'إطار مخصص فاخر مصمم بأجنحة وتيجان الذهب الملكي لغرف سليم الصوتية.',
      priceCoins: 5000,
      vipLevelRequired: 1,
      isUnlocked: true,
      rarity: 'legendary',
    });
  }

  return discovered;
}

// Convert dynamic frames to Store AvatarFrame format
export function getStoreAvatarFrames(): AvatarFrame[] {
  const dynamicFrames = getDiscoveredFrames();
  return dynamicFrames.map((df) => ({
    id: df.id,
    name: df.name,
    frameClass: '',
    imageUrl: df.imageUrl,
    previewUrl: df.imageUrl,
    priceCoins: df.priceCoins,
    vipLevelRequired: df.vipLevelRequired,
    isUnlocked: df.isUnlocked,
    description: df.description,
  }));
}

// Convert dynamic frames to Backpack InventoryItem format
export function getBackpackFrameItems(): InventoryItem[] {
  const dynamicFrames = getDiscoveredFrames();
  return dynamicFrames.map((df, index) => ({
    id: df.id,
    name: df.name,
    category: 'frames',
    categoryLabel: 'إطارات الأفاتار',
    image: df.imageUrl,
    icon: '👑',
    rarity: df.rarity,
    rarityStars: 5,
    rarityLabel: 'مخصص أسطوري',
    quantity: 1,
    expiresIn: 'دائم',
    valueCoins: df.priceCoins,
    description: df.description,
    isEquipped: index === 0, // equip the first frame by default
    colorTheme: 'from-amber-500 to-yellow-300',
    previewType: 'avatar',
  }));
}
