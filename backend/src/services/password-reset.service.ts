import { User } from "../models/index.js";
import { AppError } from "../utils/app-error.js";
import { hashPassword } from "../utils/password.js";
import { createLinkToken, escapeHtml, hashLinkToken } from "../utils/token.js";
import type { ResetPasswordInput } from "../validators/auth.validators.js";
import { sessionVersionOf } from "./auth.service.js";
import type { VerificationContext } from "./email-verification.service.js";

// Recuperação de senha por link (DEC-088, OQ-015, 09 §50–§52).
export const RESET_TTL_MINUTES = 60;
const RESET_TTL_MS = RESET_TTL_MINUTES * 60 * 1000;

export const RESET_PASSWORD_PATH = "/redefinir-senha";

// Mensagem igual para qualquer e-mail: a resposta não revela se a conta existe (09 §50).
export const FORGOT_PASSWORD_MESSAGE =
  "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha em instantes.";

// Pedido de redefinição. Só contas ATIVO recebem o link; um pedido novo
// invalida o anterior. O envio não é aguardado, para que o tempo de resposta
// seja o mesmo com ou sem conta (09 §87). Uma falha no envio fica no log.
export async function requestPasswordReset(email: string, { mailer, frontendUrl }: VerificationContext): Promise<void> {
  const { token, tokenHash } = createLinkToken();
  const user = await User.findOneAndUpdate(
    { email, status: "ATIVO" },
    { $set: { senhaResetTokenHash: tokenHash, senhaResetExpiraEm: new Date(Date.now() + RESET_TTL_MS) } },
    { returnDocument: "after" },
  )
    .select("nome email")
    .lean();

  if (!user) return;

  const link = `${frontendUrl}${RESET_PASSWORD_PATH}?token=${encodeURIComponent(token)}`;
  const firstName = user.nome.split(" ")[0] ?? user.nome;
  const notice = `O link vale por ${RESET_TTL_MINUTES} minutos e pode ser usado uma vez. Se você não pediu a redefinição, ignore esta mensagem: sua senha continua a mesma.`;

  void mailer
    .send({
      to: user.email,
      subject: "Redefina sua senha no EcoByte",
      text: [`Olá, ${firstName}!`, "", "Para definir uma nova senha no EcoByte, acesse:", link, "", notice].join("\n"),
      html: [
        `<p>Olá, ${escapeHtml(firstName)}!</p>`,
        "<p>Para definir uma nova senha no EcoByte, acesse:</p>",
        `<p><a href="${escapeHtml(link)}">Redefinir senha</a></p>`,
        `<p>${escapeHtml(notice)}</p>`,
      ].join(""),
    })
    .catch((error: unknown) => {
      console.error("[backend] Falha ao enviar e-mail de redefinição de senha:", error instanceof Error ? error.message : error);
    });
}

// Nova senha a partir do token do link. O token é de uso único, a troca
// provisória deixa de ser exigida (DEC-083) e todas as sessões abertas da
// conta são encerradas (DEC-088).
export async function resetPassword({ token, novaSenha }: ResetPasswordInput): Promise<void> {
  const tokenHash = hashLinkToken(token);
  const user = await User.findOne({ senhaResetTokenHash: tokenHash }).select("+senhaResetExpiraEm");

  if (!user || user.status !== "ATIVO") {
    throw new AppError(400, "INVALID_TOKEN", "Link de redefinição inválido ou já utilizado.");
  }

  if (!user.senhaResetExpiraEm || user.senhaResetExpiraEm.getTime() < Date.now()) {
    throw new AppError(400, "TOKEN_EXPIRED", "O link de redefinição expirou. Peça um novo link.");
  }

  const senhaHash = await hashPassword(novaSenha);

  // O filtro pelo hash garante uso único mesmo com dois envios simultâneos.
  const result = await User.updateOne(
    { _id: user._id, senhaResetTokenHash: tokenHash },
    {
      $set: {
        senhaHash,
        senhaResetTokenHash: null,
        senhaResetExpiraEm: null,
        trocaSenhaObrigatoria: false,
        sessaoVersao: sessionVersionOf(user) + 1,
      },
    },
  );

  if (result.modifiedCount === 0) {
    throw new AppError(400, "INVALID_TOKEN", "Link de redefinição inválido ou já utilizado.");
  }
}
