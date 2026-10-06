import nodemailer from "nodemailer";

export type MailMessage = { to: string; subject: string; text: string; html: string };

// Envio de e-mail desacoplado do provedor (DEC-082): SMTP em produção; no
// console em desenvolvimento e um coletor em memória nos testes.
export type Mailer = { send(message: MailMessage): Promise<void> };

export type SmtpOptions = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
};

export function createSmtpMailer(options: SmtpOptions): Mailer {
  const transporter = nodemailer.createTransport({
    host: options.host,
    port: options.port,
    secure: options.secure,
    auth: options.user && options.pass ? { user: options.user, pass: options.pass } : undefined,
  });

  return {
    async send(message) {
      await transporter.sendMail({ from: options.from, ...message });
    },
  };
}

// Desenvolvimento sem SMTP: o conteúdo (com o link) aparece no log.
export function createConsoleMailer(): Mailer {
  return {
    async send(message) {
      console.info(`[backend] E-mail para ${message.to} — ${message.subject}\n${message.text}`);
    },
  };
}
