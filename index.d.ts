import { Yearn } from "@yfi/sdk";

declare module "fastify" {
  type AbstractKey = { id: string; segment: string } | string;
  interface AbstractCacheItem {
    item: any;
    stored: Date;
    ttl: number;
  }

  interface AbstractCache {
    get(key: AbstractKey): Promise<AbstractCacheItem>;
    delete(key: AbstractKey): Promise<void>;
    has(key: AbstractKey): Promise<boolean>;
    set(key: AbstractKey, value: any, ttl: number): Promise<boolean>;
    start(): Promise<void>;
    stop(): Promise<void>;
  }
  
  interface FastifyInstance {
    sdk: Yearn<1>;
    cache: AbstractCache;
  }
  interface FastifyReply {
    expires(date?: Date | string): FastifyReply;
    etag(value?: string, lifetime?: number): FastifyReply;
  }
}
