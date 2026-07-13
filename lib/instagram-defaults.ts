export type InstagramPost = {
  id: string;
  image: string;
  url: string;
  enabled: boolean;
};

export type InstagramSource = "graph" | "manual";

export type InstagramSettings = {
  enabled: boolean;
  source: InstagramSource;
  postLimit: number;
  eyebrow: string;
  title: string;
  posts: InstagramPost[];
};

export const defaultInstagramSettings: InstagramSettings = {
  enabled: false,
  source: "graph",
  postLimit: 6,
  eyebrow: "Instagram",
  title: "Son paylaşımlar",
  posts: [],
};
