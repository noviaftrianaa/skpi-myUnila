/**
 * Subdomain Service — claim flow:
 *   1. GET options (generator 5 opsi dari profil JWT)
 *   2. POST check (validate single subdomain — untuk manual appeal)
 *   3. POST claim (create blog.blog row)
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export interface SubdomainOption {
  subdomain: string;
  reasoning: string;
  preferred?: boolean;
  available: boolean;
  reason?: string;
}

export interface SubdomainOptionsResponse {
  options: SubdomainOption[];
  tipe_role_kode: "MHS" | "STAF" | "DOSEN" | "ALUMNI";
  profile: {
    username: string;
    name: string;
    role: string;
  };
}

export interface SubdomainValidation {
  subdomain: string;
  layer1_format: boolean;
  layer2_reserved: boolean;
  layer3_unique: boolean;
  layer4_impersonation: boolean;
  available: boolean;
  reason?: string;
}

export interface ClaimInput {
  subdomain: string;
  nm_blog: string;
  nm_tampilan: string;
  tagline?: string;
}

export interface ClaimResponse {
  id_blog: string;
  subdomain: string;
}

export const subdomainService = {
  async getOptions(): Promise<SubdomainOptionsResponse> {
    const { data } = await blogClient.get<APIEnvelope<SubdomainOptionsResponse>>("/me/blog/subdomain/options");
    return data.data;
  },

  async check(subdomain: string): Promise<SubdomainValidation> {
    const { data } = await blogClient.post<APIEnvelope<SubdomainValidation>>("/me/blog/subdomain/check", { subdomain });
    return data.data;
  },

  async claim(input: ClaimInput): Promise<ClaimResponse> {
    const { data } = await blogClient.post<APIEnvelope<ClaimResponse>>("/me/blog/claim", input);
    return data.data;
  },
};
