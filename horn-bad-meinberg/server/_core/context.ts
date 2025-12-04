import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import type { TenantInfo } from "../tenant-middleware";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"] & { tenant?: TenantInfo };
  res: CreateExpressContextOptions["res"];
  user: User | null;
  tenant: TenantInfo;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Get tenant from middleware
  const tenant = (opts.req as any).tenant;
  
  if (!tenant) {
    throw new Error('Tenant not found in request context. Make sure tenant-middleware is registered before tRPC.');
  }

  return {
    req: opts.req as CreateExpressContextOptions["req"] & { tenant?: TenantInfo },
    res: opts.res,
    user,
    tenant,
  };
}
