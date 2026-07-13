import { heroCaptions, heroPalettes } from "@/components/home/heroData";

export type HeroCard = {
  id: string;
  caption: string;
  image: string;
  palette: [string, string, string];
  enabled: boolean;
};

export type HeroSettings = {
  cards: HeroCard[];
};

export function buildDefaultHeroCards(): HeroCard[] {
  return heroCaptions.map((caption, index) => ({
    id: `default-${index}`,
    caption,
    image: "",
    palette: heroPalettes[index % heroPalettes.length],
    enabled: true,
  }));
}

export const defaultHeroSettings: HeroSettings = {
  cards: buildDefaultHeroCards(),
};
