import { Stats } from "@shared/models/common/stats";

interface Profile {
  name: string;
  about: string;
  website: string;
  location: string;
  cover_image: string;
  profile_image: string;
  blacklist_description: string;
  muted_list_description: string;
}

interface Metadata {
  profile: Profile
}

export interface UserProfile {
  id: number;
  name: string;
  metadata: Metadata;
  post_count: number;
  reputation: number;
  active: Date;
  blacklists: string[];
  created: Date;
  stats: Stats;
  followers: number;
  following: number;
  rank: number;
}
