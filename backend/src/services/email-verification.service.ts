import { createHash, randomBytes } from "node:crypto";
import { Types } from "mongoose";
import { User } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import type { Mailer } from "./mailer.js";

// Verificação de e-mail por link (DEC-082, OQ-001).
export const VERIFICATION_TTL_HOURS = 24;
const VERIFICATION_TTL_MS = VERIFICATION_TTL_HOURS * 60 * 60 * 1000;

export const VERIFY_EMAIL_PATH = "/verificar-email";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type VerificationContext = { mailer: Mailer; frontendUrl: string };

// Gera um token novo (o anterior deixa de valer), guarda só o hash e envia o
// link. Uma falha no envio fica no log: o usuário pode pedir o reenvio.
export async function sendVerificationEmail(
  userId: Types.ObjectId | string,
  { mailer, frontendUrl }: VerificationContext,
): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        emailVerificacaoTokenHash: hashToken(token),
        emailVerificacaoExpiraEm: new Date(Date.now() + VERIFICATION_TTL_MS),
      },
    },
    { returnDocument: "after" },
  )
    .select("nome email")
    .lean();

  if (!user) return;

  const link = `${frontendUrl}${VERIFY_EMAIL_PATH}?token=${encodeURIComponent(token)}`;
  const firstName = user.nome.split(" ")[0] ?? user.nome;

  try {
    await mailer.send({
      to: user.email,
      subject: "Confirme seu e-mail no EcoByte",
      text: [
        `Olá, ${firstName}!`,
        "",
        "Confirme seu e-mail para solicitar coletas no EcoByte:",
        link,
        "",
        `O link vale por ${VERIFICATION_TTL_HOURS} horas. Se você não criou uma conta no EcoByte, ignore esta mensagem.`,
      ].join("\n"),
      html: [
        `<p>Olá, ${escapeHtml(firstName)}!</p>`,
        "<p>Confirme seu e-mail para solicitar coletas no EcoByte:</p>",
        `<p><a href="${escapeHtml(link)}">Confirmar e-mail</a></p>`,
        `<p>O link vale por ${VERIFICATION_TTL_HOURS} horas. Se você não criou uma conta no EcoByte, ignore esta mensagem.</p>`,
      ].join(""),
    });
  } catch (error) {
    console.error("[backend] Falha ao enviar e-mail de verificação:", error instanceof Error ? error.message : error);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Confirma o e-mail a partir do token do link. O token é de uso único.
export async function verifyEmail(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  const user = await User.findOne({ emailVerificacaoTokenHash: tokenHash }).select("+emailVerificacaoExpiraEm").lean();

  if (!user) throw new AppError(400, "INVALID_TOKEN", "Link de confirmação inválido ou já utilizado.");

  if (!user.emailVerificacaoExpiraEm || user.emailVerificacaoExpiraEm.getTime() < Date.now()) {
    throw new AppError(400, "TOKEN_EXPIRED", "O link de confirmação expirou. Peça um novo link.");
  }

  // O filtro pelo hash garante uso único mesmo com dois cliques simultâneos.
  await User.updateOne(
    { _id: user._id, emailVerificacaoTokenHash: tokenHash },
    { $set: { emailVerificado: true, emailVerificacaoTokenHash: null, emailVerificacaoExpiraEm: null } },
  );
}

// Reenvio a pedido do próprio usuário (sessão).
export async function resendVerificationEmail(userId: string, context: VerificationContext): Promise<void> {
  const user = await User.findById(new Types.ObjectId(userId)).select("emailVerificado").lean();
  if (!user) throw new AppError(404, "RESOURCE_NOT_FOUND", "Usuário não encontrado.");

  if (user.emailVerificado !== false) {
    throw new AppError(409, "EMAIL_ALREADY_VERIFIED", "Seu e-mail já está confirmado.");
  }

  await sendVerificationEmail(user._id, context);
}
