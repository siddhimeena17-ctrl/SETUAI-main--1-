"use server";

import {
  bootstrapAdminAction as bootstrapAdmin,
  loginAdminAction as loginAdmin,
  logoutAdminAction as logoutAdmin,
  verifyLoginTotpAction as verifyLoginTotp,
  verifySetupTotpAction as verifySetupTotp,
  type AdminAuthFormState,
} from "@/lib/admin-auth";

export async function bootstrapAdminAction(state: AdminAuthFormState, formData: FormData) {
  return bootstrapAdmin(state, formData);
}

export async function loginAdminAction(state: AdminAuthFormState, formData: FormData) {
  return loginAdmin(state, formData);
}

export async function verifyLoginTotpAction(state: AdminAuthFormState, formData: FormData) {
  return verifyLoginTotp(state, formData);
}

export async function verifySetupTotpAction(state: AdminAuthFormState, formData: FormData) {
  return verifySetupTotp(state, formData);
}

export async function logoutAdminAction() {
  return logoutAdmin();
}
