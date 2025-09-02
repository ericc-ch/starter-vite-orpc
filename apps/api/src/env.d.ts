// This file infers types for the cloudflare:workers environment from your Alchemy Worker.
// @see https://alchemy.run/concepts/bindings/#type-safe-bindings

import type { api } from "../../../alchemy.run"

export type CloudflareEnv = typeof api.Env

declare global {
  type Env = CloudflareEnv
}

declare module "cloudflare:workers" {
  namespace Cloudflare {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface Env extends CloudflareEnv {}
  }
}
