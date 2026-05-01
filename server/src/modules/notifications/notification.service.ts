import { prisma } from "../../config/prisma";
import { emitToUser } from "../../config/realtime";

type NotificationChannel = "email" | "sms";

type NotificationPayload = {
  toEmail?: string | null;
  toPhone?: string | null;
  subject: string;
  sms: string;
  preview: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  rows?: Array<{ label: string; value: string }>;
  items?: Array<{ name: string; quantity: number; price: number }>;
  userId?: string;
  type?: string;
};

const nodemailer = require("nodemailer") as typeof import("nodemailer");

const appName = process.env.APP_NAME || "E-Commerce";
const appUrl = process.env.CLIENT_URL || "http://localhost:5173";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const renderEmail = (payload: NotificationPayload) => {
  const rows = payload.rows
    ?.map(
      (row) => `
        <tr>
          <td style="padding:12px 0;color:#64748b;font-size:14px;">${escapeHtml(row.label)}</td>
          <td style="padding:12px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(row.value)}</td>
        </tr>`
    )
    .join("");
  const items = payload.items
    ?.map(
      (item) => `
        <tr>
          <td style="padding:14px 0;color:#0f172a;font-size:14px;font-weight:700;">${escapeHtml(item.name)}</td>
          <td style="padding:14px 0;color:#64748b;font-size:14px;text-align:center;">${item.quantity}</td>
          <td style="padding:14px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${money(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f7fb;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(payload.preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;box-shadow:0 16px 45px rgba(15,23,42,0.08);">
            <tr>
              <td style="background:#111827;padding:28px 32px;color:#ffffff;">
                <div style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#cbd5e1;">${escapeHtml(appName)}</div>
                <h1 style="margin:14px 0 0;font-size:28px;line-height:1.2;">${escapeHtml(payload.title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0;color:#334155;font-size:16px;line-height:1.7;">${escapeHtml(payload.body)}</p>
                ${
                  rows
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:26px;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">${rows}</table>`
                    : ""
                }
                ${
                  items
                    ? `<h2 style="margin:28px 0 0;color:#0f172a;font-size:18px;">Items ordered</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;"><tr><th align="left" style="padding:10px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Item</th><th align="center" style="padding:10px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Qty</th><th align="right" style="padding:10px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Total</th></tr>${items}</table>`
                    : ""
                }
                ${
                  payload.ctaLabel
                    ? `<a href="${escapeHtml(payload.ctaUrl || appUrl)}" style="display:inline-block;margin-top:28px;background:#111827;color:#ffffff;text-decoration:none;border-radius:14px;padding:14px 20px;font-size:14px;font-weight:700;">${escapeHtml(payload.ctaLabel)}</a>`
                    : ""
                }
                <p style="margin:30px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">You received this notification because your account or order activity changed on ${escapeHtml(appName)}.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const sendEmail = async (payload: NotificationPayload) => {
  if (!payload.toEmail) return;

  const html = renderEmail(payload);
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const fromEmail =
    process.env.NOTIFICATION_FROM_EMAIL ||
    (gmailUser ? `${appName} <${gmailUser}>` : undefined);

  if (!gmailUser || !gmailAppPassword || !fromEmail) {
    console.info("[notification:email]", {
      to: payload.toEmail,
      subject: payload.subject,
      reason: "Missing GMAIL_USER or GMAIL_APP_PASSWORD",
      html,
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  await transporter.sendMail({
    from: fromEmail,
    to: payload.toEmail,
    subject: payload.subject,
    html,
    text: `${payload.title}\n\n${payload.body}`,
  });
};

const sendSms = async (payload: NotificationPayload) => {
  if (!payload.toPhone) return;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_PHONE;

  if (!sid || !token || !from) {
    console.info("[notification:sms]", {
      to: payload.toPhone,
      message: payload.sms,
    });
    return;
  }

  const body = new URLSearchParams({
    To: payload.toPhone,
    From: from,
    Body: payload.sms,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    throw new Error(`SMS notification failed with ${response.status}`);
  }
};

export const notifyUser = async (
  payload: NotificationPayload,
  channels: NotificationChannel[] = ["email", "sms"]
) => {
  if (payload.userId) {
    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.preview || payload.body,
        type: payload.type || "GENERAL",
      },
    });

    emitToUser(payload.userId, "notification:new", {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    });
  }

  const results = await Promise.allSettled(
    channels.map((channel) =>
      channel === "email" ? sendEmail(payload) : sendSms(payload)
    )
  );

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("[notification:error]", result.reason);
    }
  });
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const shortOrderId = (orderId: string) => `#${orderId.slice(0, 8)}`;

type NotifiableUser = {
  id?: string;
  name?: string;
  email: string;
  phone?: string | null;
};

type NotifiableOrder = {
  id: string;
  totalAmount: number;
  status?: string;
  user: NotifiableUser;
  items?: Array<{ name: string; quantity: number; price: number }>;
};

export const notificationEvents = {
  signup: (user: Required<Pick<NotifiableUser, "name" | "email">> & Pick<NotifiableUser, "id" | "phone">) =>
    notifyUser({
      userId: user.id,
      type: "ACCOUNT",
      toEmail: user.email,
      toPhone: user.phone,
      subject: `Welcome to ${appName}`,
      title: `Welcome, ${user.name}`,
      preview: "Your account is ready.",
      body: "Your account has been created successfully. You can now browse products, place orders, and track purchases from your dashboard.",
      sms: `${appName}: Welcome ${user.name}. Your account is ready.`,
      ctaLabel: "Start shopping",
      ctaUrl: appUrl,
    }),

  login: (user: Required<Pick<NotifiableUser, "name" | "email">> & Pick<NotifiableUser, "id" | "phone">) =>
    notifyUser({
      userId: user.id,
      type: "SECURITY",
      toEmail: user.email,
      toPhone: user.phone,
      subject: `${appName} login alert`,
      title: "New login to your account",
      preview: "We noticed a fresh sign-in.",
      body: "Your account was just signed in. If this was you, no action is needed.",
      sms: `${appName}: New login detected for your account. If this was not you, please reset your password.`,
    }),

  orderPlaced: (order: NotifiableOrder) =>
    notifyUser({
      userId: order.user.id,
      type: "ORDER",
      toEmail: order.user.email,
      toPhone: order.user.phone,
      subject: `Order ${shortOrderId(order.id)} placed`,
      title: "Your order is placed",
      preview: "We received your order.",
      body: "We received your order and are waiting for payment confirmation. You will get another update once payment is complete.",
      sms: `${appName}: Order ${shortOrderId(order.id)} placed for ${money(order.totalAmount)}. Complete payment to confirm it.`,
      rows: [
        { label: "Order", value: shortOrderId(order.id) },
        { label: "Total", value: money(order.totalAmount) },
        { label: "Status", value: "Pending payment" },
      ],
      items: order.items,
      ctaLabel: "View orders",
      ctaUrl: `${appUrl}/orders`,
    }),

  orderStatusChanged: (order: NotifiableOrder & { status: string }) =>
    notifyUser({
      userId: order.user.id,
      type: "ORDER_STATUS",
      toEmail: order.user.email,
      toPhone: order.user.phone,
      subject: `Order ${shortOrderId(order.id)} is now ${order.status}`,
      title: "Order status updated",
      preview: `Your order status changed to ${order.status}.`,
      body: `Your order has moved to ${order.status}. We will keep you posted as it progresses.`,
      sms: `${appName}: Order ${shortOrderId(order.id)} status is now ${order.status}.`,
      rows: [
        { label: "Order", value: shortOrderId(order.id) },
        { label: "Total", value: money(order.totalAmount) },
        { label: "Status", value: order.status },
      ],
      ctaLabel: "Track order",
      ctaUrl: `${appUrl}/orders`,
    }),

  payment: (order: NotifiableOrder, status: string) =>
    notifyUser({
      userId: order.user.id,
      type: "PAYMENT",
      toEmail: order.user.email,
      toPhone: order.user.phone,
      subject: `Payment ${status.toLowerCase()} for ${shortOrderId(order.id)}`,
      title: `Payment ${status.toLowerCase()}`,
      preview: `Payment update for ${shortOrderId(order.id)}.`,
      body: `Your payment for order ${shortOrderId(order.id)} is ${status.toLowerCase()}.`,
      sms: `${appName}: Payment ${status.toLowerCase()} for order ${shortOrderId(order.id)} (${money(order.totalAmount)}).`,
      rows: [
        { label: "Order", value: shortOrderId(order.id) },
        { label: "Amount", value: money(order.totalAmount) },
        { label: "Payment status", value: status },
      ],
    }),

  refund: (order: NotifiableOrder, status: string) =>
    notifyUser({
      userId: order.user.id,
      type: "REFUND",
      toEmail: order.user.email,
      toPhone: order.user.phone,
      subject: `Refund ${status.toLowerCase()} for ${shortOrderId(order.id)}`,
      title: `Refund ${status.toLowerCase()}`,
      preview: `Refund update for ${shortOrderId(order.id)}.`,
      body: `Your refund for order ${shortOrderId(order.id)} is ${status.toLowerCase()}. Bank processing times may vary after the gateway accepts the refund.`,
      sms: `${appName}: Refund ${status.toLowerCase()} for order ${shortOrderId(order.id)} (${money(order.totalAmount)}).`,
      rows: [
        { label: "Order", value: shortOrderId(order.id) },
        { label: "Refund amount", value: money(order.totalAmount) },
        { label: "Refund status", value: status },
      ],
    }),
};
