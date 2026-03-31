
import { Stats } from "../common/stats"
import { JsonMetadata } from "./json_metadata"

export interface Post {
  post_id: number;
  author: string;
  permlink: string;
  category: string;
  title: string;
  body: string;
  json_metadata: JsonMetadata
  created: Date;
  updated: Date;
  depth: number;
  children: number;
  net_rshares: number;
  is_paidout: boolean
  payout_at: Date;
  payout: number;
  pending_payout_value: string;
  author_payout_value: string;
  curator_payout_value: string;
  promoted: string;
  replies: string[];
  author_reputation: number;
  stats: Stats;
  url: string;
  beneficiaries: string[];
  max_accepted_payout: string;
  percent_hbd: number;
  active_votes: string[];
  blacklists: string[];
}
