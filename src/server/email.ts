// =====================================================================
//  Відправка email-сповіщення фахівцю з Server Action (§3.7 диплома)
//
//  Використовує nodemailer + SMTP з .env. Якщо SMTP не налаштований
//  (демо/розробка) — тихо no-op, щоб не ламати потік бронювання.
// =====================================================================

import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null; // демо-режим без пошти

  transporter = nodemailer.createTransport({
    host,
    port: Number(port ?? 587),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
  return transporter;
}

export interface BookingNotification {
  providerEmail: string;
  providerName: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  comment?: string;
}

/** Повідомити фахівця про нове бронювання. No-op без SMTP. */
export async function notifyProvider(n: BookingNotification): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.log(`📧 [demo-email] → ${n.providerEmail}: бронювання ${n.serviceName} на ${n.date} ${n.time}`);
    return;
  }

  await t.sendMail({
    from: process.env.SMTP_FROM ?? "HAVEN <noreply@haven.ua>",
    to: n.providerEmail,
    subject: `Нове бронювання — ${n.serviceName}`,
    text: [
      `Привіт, ${n.providerName}!`,
      ``,
      `Клієнт ${n.clientName} забронював вашу послугу:`,
      `📌 Послуга: ${n.serviceName}`,
      `📅 Дата: ${n.date}, ${n.time}`,
      n.comment ? `💬 Коментар: ${n.comment}` : null,
      ``,
      `Зв'яжіться з клієнтом для підтвердження деталей.`,
      ``,
      `HAVEN`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
