import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { formatDate, formatPriceExact, trailLabel } from "./format";
import { site } from "./site";
import type { BookingWithEvent } from "./types";

const OUTBOX_DIR = path.join(
  process.env.PHC_DATA_DIR ? path.resolve(process.env.PHC_DATA_DIR) : path.join(process.cwd(), ".data"),
  "outbox",
);

type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function deliver(mail: Mail): Promise<void> {
  const from = process.env.MAIL_FROM ?? `${site.name} <${site.email}>`;

  if (smtpConfigured()) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    });

    await transport.sendMail({ from, ...mail });
    return;
  }

  // No SMTP credentials configured: write the message to a local outbox so that
  // the booking flow still works in development and nothing is silently lost.
  fs.mkdirSync(OUTBOX_DIR, { recursive: true });
  const filename = `${Date.now()}-${mail.to.replace(/[^a-z0-9]+/gi, "-")}.html`;
  fs.writeFileSync(
    path.join(OUTBOX_DIR, filename),
    `<!-- To: ${mail.to} | Subject: ${mail.subject} -->\n${mail.html}`,
    "utf8",
  );
  console.info(`[email] SMTP not configured — wrote "${mail.subject}" to .data/outbox/${filename}`);
}

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f8f6f1;font-family:Helvetica,Arial,sans-serif;color:#05100b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(6,26,17,0.10);">
            <tr>
              <td style="background:#061a11;padding:28px 32px;">
                <p style="margin:0;color:#7ecb9c;font-size:11px;letter-spacing:.22em;text-transform:uppercase;font-weight:700;">${site.name}</p>
                <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;line-height:1.15;">${title}</h1>
              </td>
            </tr>
            <tr><td style="padding:32px;">${body}</td></tr>
            <tr>
              <td style="padding:24px 32px;background:#f8f6f1;color:#6f7a72;font-size:12px;line-height:1.6;">
                <p style="margin:0 0 6px;">${site.name} · ${site.city}</p>
                <p style="margin:0;">
                  <a href="${site.url}" style="color:#14512f;">${site.url.replace(/^https?:\/\//, "")}</a> ·
                  <a href="${site.instagram}" style="color:#14512f;">Instagram</a> ·
                  <a href="${site.whatsapp}" style="color:#14512f;">WhatsApp</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #ece5d8;color:#6f7a72;font-size:13px;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #ece5d8;text-align:right;font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}

export async function sendBookingConfirmation(booking: BookingWithEvent): Promise<void> {
  const { event } = booking;
  const paymentLine =
    booking.paymentStatus === "not_required"
      ? "Free event"
      : booking.paymentStatus === "paid"
        ? `Paid · ${formatPriceExact(booking.amountCents)}`
        : `Payment outstanding · ${formatPriceExact(booking.amountCents)}`;

  const eftBlock =
    booking.paymentStatus === "pending"
      ? `<div style="margin-top:24px;padding:18px;border-radius:16px;background:#f8f6f1;">
           <p style="margin:0 0 8px;font-weight:700;font-size:14px;">EFT payment details</p>
           <p style="margin:0;font-size:13px;line-height:1.7;color:#3c4a42;">
             ${site.bank.accountName}<br/>
             ${site.bank.bank} · Account ${site.bank.accountNumber}<br/>
             Branch code ${site.bank.branchCode}<br/>
             <strong>Reference: ${booking.reference}</strong>
           </p>
           <p style="margin:10px 0 0;font-size:12px;color:#6f7a72;">Please send proof of payment to ${site.email} at least 48 hours before the event.</p>
         </div>`
      : "";

  const scheduleRows = event.schedule
    .map(
      (item) =>
        `<tr>
           <td style="padding:6px 12px 6px 0;font-size:13px;font-weight:700;color:#14512f;white-space:nowrap;">${item.time}</td>
           <td style="padding:6px 0;font-size:13px;color:#3c4a42;">${item.title}</td>
         </tr>`,
    )
    .join("");

  const html = layout(
    "You're booked! 🥾",
    `<p style="margin:0 0 20px;font-size:15px;line-height:1.7;">Hi ${booking.name.split(" ")[0]},</p>
     <p style="margin:0 0 24px;font-size:15px;line-height:1.7;">Your spot on <strong>${event.title}</strong> is confirmed. Here are your details — save this email, you will need your reference on the day.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${detailRow("Booking reference", booking.reference)}
       ${detailRow("Event", event.title)}
       ${detailRow("Date", formatDate(event.date))}
       ${detailRow("Arrival", event.arrivalTime)}
       ${detailRow("Start time", event.startTime)}
       ${detailRow("Trail", booking.distance)}
       ${detailRow("Location", event.location)}
       ${detailRow("Meeting point", event.meetingPoint)}
       ${detailRow("People", String(booking.people))}
       ${detailRow("Payment", paymentLine)}
     </table>
     ${eftBlock}
     <div style="margin-top:24px;padding:18px;border-radius:16px;background:#061a11;color:#ffffff;">
       <p style="margin:0;font-size:14px;font-weight:700;">⏰ Please arrive on time</p>
       <p style="margin:6px 0 0;font-size:13px;line-height:1.6;color:#d9f0e2;">Late arrivals may not be accommodated once the hike has started. Be at ${event.meetingPoint} by ${event.arrivalTime}.</p>
     </div>
     <p style="margin:24px 0 10px;font-size:14px;font-weight:700;">Programme for the day</p>
     <table role="presentation" cellpadding="0" cellspacing="0">${scheduleRows}</table>
     <p style="margin:26px 0 0;font-size:15px;line-height:1.7;">See you on the trail!<br/><strong>The ${site.name} crew</strong></p>
     <p style="margin:18px 0 0;">
       <a href="${site.url}/events/${event.slug}" style="display:inline-block;background:#14512f;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;font-size:14px;">View event details</a>
     </p>`,
  );

  const text = [
    `Hi ${booking.name.split(" ")[0]},`,
    ``,
    `Your spot on ${event.title} is confirmed.`,
    ``,
    `Reference: ${booking.reference}`,
    `Date: ${formatDate(event.date)}`,
    `Arrival: ${event.arrivalTime} (hike starts ${event.startTime})`,
    `Trail: ${booking.distance} (${trailLabel(event)} available)`,
    `Location: ${event.location}`,
    `Meeting point: ${event.meetingPoint}`,
    `People: ${booking.people}`,
    `Payment: ${paymentLine}`,
    ``,
    `PLEASE ARRIVE ON TIME — late arrivals may not be accommodated once the hike has started.`,
    ``,
    `${site.url}/events/${event.slug}`,
  ].join("\n");

  await deliver({
    to: booking.email,
    subject: `Booking confirmed · ${event.title} (${booking.reference})`,
    html,
    text,
  });
}

export async function sendAdminBookingAlert(booking: BookingWithEvent): Promise<void> {
  const to = process.env.ADMIN_EMAIL ?? site.email;
  const { event } = booking;

  await deliver({
    to,
    subject: `New booking · ${event.title} · ${booking.people} spot(s)`,
    html: layout(
      "New booking received",
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
         ${detailRow("Event", event.title)}
         ${detailRow("Date", formatDate(event.date))}
         ${detailRow("Name", booking.name)}
         ${detailRow("Email", booking.email)}
         ${detailRow("Phone", booking.phone)}
         ${detailRow("Trail", booking.distance)}
         ${detailRow("People", String(booking.people))}
         ${detailRow("Amount", formatPriceExact(booking.amountCents))}
         ${detailRow("Payment", `${booking.paymentMethod} · ${booking.paymentStatus}`)}
         ${detailRow("Reference", booking.reference)}
       </table>
       <p style="margin:22px 0 0;">
         <a href="${site.url}/admin/events/${event.id}/bookings" style="display:inline-block;background:#14512f;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;font-size:14px;">Open attendee list</a>
       </p>`,
    ),
    text: `New booking for ${event.title}: ${booking.name} (${booking.people} spot(s), ${booking.distance}) — ${booking.reference}`,
  });
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  await deliver({
    to: process.env.ADMIN_EMAIL ?? site.email,
    subject: `Website enquiry from ${input.name}`,
    html: layout(
      "New website enquiry",
      `<p style="margin:0 0 12px;font-size:14px;"><strong>${input.name}</strong> &lt;${input.email}&gt;</p>
       <p style="margin:0;font-size:15px;line-height:1.7;white-space:pre-wrap;">${input.message.replace(/</g, "&lt;")}</p>`,
    ),
    text: `${input.name} <${input.email}>\n\n${input.message}`,
  });
}
