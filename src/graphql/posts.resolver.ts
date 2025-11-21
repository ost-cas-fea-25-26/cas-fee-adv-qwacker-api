import { HttpException, UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ByteResolver as Byte } from 'graphql-scalars';
import { User } from 'src/auth/user';
import { PostsService } from 'src/data/posts.service';
import { AggregatedPost } from 'src/entities';
import {
  GqlUser,
  OptionalZitadelGraphqlAuthGuard,
  ZitadelGraphqlAuthGuard,
} from './graphql.guard';
import {
  CreatePostResult,
  DeletedPost,
  ListResult,
  Post,
  RepliesResult,
  Reply,
  SearchParams,
  SearchPostResult,
  SearchResult,
  SingleResult,
} from './graphql.models';

const mapPostResult =
  (user: User) =>
  (post: AggregatedPost): Post | Reply | DeletedPost =>
    post.deleted
      ? Object.assign(new DeletedPost(), {
          id: post.id,
          creator: post.creator,
        })
      : post.parentId
        ? Object.assign(new Reply(), {
            id: post.id,
            creator: post.creator,
            text: post.text,
            mediaUrl: post.mediaUrl,
            mediaType: post.mediaType,
            likeCount: post.likers.length,
            likedByUser: post.likers.includes(user?.sub ?? ''),
            parentId: post.parentId,
          })
        : Object.assign(new Post(), {
            id: post.id,
            creator: post.creator,
            text: post.text,
            mediaUrl: post.mediaUrl,
            mediaType: post.mediaType,
            likeCount: post.likers.length,
            likedByUser: post.likers.includes(user?.sub ?? ''),
            replyCount: post.replyCount,
          });

@Resolver(() => RepliesResult)
@Resolver(() => ListResult)
@Resolver(() => SearchResult)
export class PostsResolver {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(OptionalZitadelGraphqlAuthGuard)
  @Query(() => ListResult, {
    name: 'posts',
    description:
      'Query a list of posts defined by the pagination params. The list is ordered by the creation time of the posts. The list may contain deleted posts, but no replies.',
  })
  async list(
    @Args('offset', {
      type: () => Int,
      defaultValue: 0,
      description: 'The offset for the pagination. Defaults to 0.',
    })
    offset: number,
    @Args('limit', {
      type: () => Int,
      defaultValue: 100,
      description:
        'The limit for the pagination. Defaults to 100. Minimum is 1, maximum is 1000.',
    })
    limit: number,
    @GqlUser() user: User,
    @Args('newerThan', {
      type: () => String,
      nullable: true,
      description: 'If set, only return posts newer than this ID.',
    })
    newerThan?: string,
  ): Promise<ListResult> {
    const { count, posts } = await this.posts.list(offset, limit, newerThan);

    return {
      count,
      data: posts.map(mapPostResult(user)),
      nextPageOffset: count > offset + limit ? offset + limit : undefined,
      previousPageOffset: offset > 0 ? Math.max(offset - limit, 0) : undefined,
    };
  }

  @UseGuards(OptionalZitadelGraphqlAuthGuard)
  @Query(() => SearchResult, {
    description: 'Search posts and replies in the database.',
  })
  async search(
    @Args() { offset = 0, limit = 100, ...params }: SearchParams,
    @GqlUser() user: User,
  ): Promise<SearchResult> {
    const { count, posts } = await this.posts.search(params, offset, limit);

    return {
      count,
      data: posts.map(mapPostResult(user)) as any as Array<
        typeof SearchPostResult
      >,
      nextPageOffset: count > offset + limit ? offset + limit : undefined,
      previousPageOffset: offset > 0 ? Math.max(offset - limit, 0) : undefined,
    };
  }

  @UseGuards(OptionalZitadelGraphqlAuthGuard)
  @Query(() => SingleResult, {
    description: 'Fetch a specific post.',
  })
  async post(
    @Args('id', {
      type: () => ID,
      nullable: false,
      description: 'The ID of the post.',
    })
    id: string,
    @GqlUser() user: User,
  ): Promise<SingleResult> {
    if (!id) {
      throw new HttpException('id is required', 400);
    }

    const { post, replies } = await this.posts.getPostWithReplies(id);

    return {
      post: mapPostResult(user)(post),
      replies: replies.map(mapPostResult(user)),
    };
  }

  @UseGuards(OptionalZitadelGraphqlAuthGuard)
  @Query(() => [RepliesResult], {
    description: 'Fetch a list of replies to a specific post.',
  })
  async replies(
    @Args('id', {
      type: () => ID,
      nullable: false,
      description: 'The ID of the parent post.',
    })
    id: string,
    @GqlUser() user: User,
  ): Promise<Array<typeof RepliesResult>> {
    if (!id) {
      throw new HttpException('id is required', 400);
    }

    const { replies } = await this.posts.getPostWithReplies(id);

    return replies.map(mapPostResult(user));
  }

  @UseGuards(ZitadelGraphqlAuthGuard)
  @Mutation(() => ID, {
    description: 'Like a post in the system.',
  })
  async like(
    @Args('id', {
      type: () => ID,
      nullable: false,
      description: 'The ID of the post that should be liked.',
    })
    id: string,
    @GqlUser() user: User,
  ) {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    if (!id || id.length <= 0) {
      throw new HttpException('id is required', 400);
    }

    await this.posts.like(id, user.sub);
    return id;
  }

  @UseGuards(ZitadelGraphqlAuthGuard)
  @Mutation(() => ID, {
    description: 'Delete a like on a post in the system.',
  })
  async unlike(
    @Args('id', {
      type: () => ID,
      nullable: false,
      description: 'The ID of the post that should be unliked.',
    })
    id: string,
    @GqlUser() user: User,
  ) {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    if (!id || id.length <= 0) {
      throw new HttpException('id is required', 400);
    }

    await this.posts.unlike(id, user.sub);
    return id;
  }

  @UseGuards(ZitadelGraphqlAuthGuard)
  @Mutation(() => CreatePostResult, {
    description: 'Create a new post or a reply to a post.',
  })
  async create(
    @GqlUser() user: User,
    @Args('text', {
      type: () => String,
      description: 'The text for the post.',
      nullable: false,
    })
    text: string,
    @Args('parentId', {
      type: () => ID,
      description:
        'Defines the parent post for a reply, if any. When omitted, a new "post" is created instead of a reply.',
      nullable: true,
    })
    parentId?: string,
    @Args('media', {
      type: () => Byte,
      description: 'Base64 encoded media file for the post.',
      nullable: true,
    })
    media?: Buffer,
    @Args('mediaType', {
      type: () => String,
      description:
        'The mimetype for the media. If media is set, this is required.',
      nullable: true,
    })
    mediaType?: string,
  ) {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    if (media && !mediaType) {
      throw new HttpException('mediaType is required when media is set', 400);
    }

    const post = await this.posts.create({
      text,
      parentId,
      userId: user.sub,
      mediaBuffer: media,
      mediaType: mediaType,
    });

    return mapPostResult(user)(post);
  }

  @UseGuards(ZitadelGraphqlAuthGuard)
  @Mutation(() => ID, {
    description: 'Delete a post in the system.',
  })
  async delete(
    @Args('id', {
      type: () => ID,
      nullable: false,
      description: 'The ID of the post that should be unliked.',
    })
    id: string,
    @GqlUser() user: User,
  ) {
    if (!user || !user.sub) {
      throw new HttpException('Forbidden', 403);
    }

    if (!id || id.length <= 0) {
      throw new HttpException('id is required', 400);
    }

    await this.posts.delete(id, user.sub);
    return id;
  }
}
