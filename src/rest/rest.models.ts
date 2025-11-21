import { User } from 'src/auth/user';
import { SearchParams } from 'src/data/data.models';
import { AggregatedPost } from 'src/entities';

export type PaginatedResult<TData> = PaginatedSearchResult<TData, string>;

export type PaginatedSearchResult<TData, TParams> = {
  data: TData[];
  count: number;
  next?: TParams;
  previous?: TParams;
};

export type PostSearchParams = SearchParams & {
  offset?: number;
  limit?: number;
};

export type CreatePostParams = {
  text: string;
};

type BasePost = {
  id: string;
  creator: string;
  text: string;
  mediaUrl?: string;
  mediaType?: string;
  likeCount: number;
  likedByUser: boolean;
};

export type Post = BasePost & {
  type: 'post';
  replyCount: number;
};

export type Reply = BasePost & {
  type: 'reply';
  parentId: string;
};

export type DeletedPost = {
  type: 'deleted';
  id: string;
  creator: string;
  parentId?: string;
};

export type PostResult = Post | Reply | DeletedPost;

export const mapPostResult =
  (user: User) =>
  (agg: AggregatedPost): PostResult => {
    if (agg.deleted) {
      return agg.parentId
        ? {
            type: 'deleted',
            id: agg.id,
            creator: agg.creator,
            parentId: agg.parentId,
          }
        : {
            type: 'deleted',
            id: agg.id,
            creator: agg.creator,
          };
    }

    const base = {
      id: agg.id,
      creator: agg.creator,
      text: agg.text,
      mediaUrl: agg.mediaUrl,
      mediaType: agg.mediaType,
      likeCount: agg.likers.length,
      likedByUser: agg.likers.includes(user ? (user.sub ?? '') : ''),
    };

    return agg.parentId
      ? {
          ...base,
          type: 'reply',
          parentId: agg.parentId,
        }
      : {
          ...base,
          type: 'post',
          replyCount: agg.replyCount,
        };
  };
