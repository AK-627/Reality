import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "UK Realty <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

function isConfigured() {
  return !!(process.env.RESEND_API_KEY && ADMIN_EMAIL);
}

export async function sendEnquiryNotification(enquiry: {
  name: string;
  email: string;
  phone: string;
  message: string;
  listingTitle: string;
  listingId: string;
}) {
  if (!isConfigured()) {
    console.warn("[Email] Skipped: RESEND_API_KEY or ADMIN_EMAIL not set");
    return;
  }
  const listingUrl = `${process.env.NEXTAUTH_URL ?? ""}/listings/${enquiry.listingId}`;
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Enquiry: ${enquiry.listingTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h2 style="border-bottom:2px solid #000;padding-bottom:8px">New Property Enquiry</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 0;color:#555;width:120px">Property</td><td style="padding:8px 0;font-weight:600"><a href="${listingUrl}" style="color:#000">${enquiry.listingTitle}</a></td></tr>
          <tr><td style="padding:8px 0;color:#555">Name</td><td style="padding:8px 0">${enquiry.name}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Email</td><td style="padding:8px 0"><a href="mailto:${enquiry.email}" style="color:#000">${enquiry.email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#555">Phone</td><td style="padding:8px 0"><a href="tel:${enquiry.phone}" style="color:#000">${enquiry.phone}</a></td></tr>
        </table>
        <div style="background:#f5f5f5;border-left:3px solid #000;padding:12px 16px;margin:16px 0">
          <p style="margin:0;color:#555;font-size:13px">Message</p>
          <p style="margin:8px 0 0;white-space:pre-wrap">${enquiry.message}</p>
        </div>
        <p style="font-size:12px;color:#999;margin-top:24px">UK Realty Admin</p>
      </div>
    `,
  });
}

export async function sendEnquiryConfirmation(to: string, customerName: string, listingTitle: string) {
  if (!isConfigured()) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `We received your enquiry about ${listingTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h2 style="border-bottom:2px solid #000;padding-bottom:8px">Thanks for your enquiry</h2>
        <p>Hi ${customerName},</p>
        <p>We've received your enquiry about <strong>${listingTitle}</strong> and our team will get back to you shortly.</p>
        <p style="color:#555">If you have any urgent questions, feel free to reply to this email.</p>
        <p style="margin-top:32px">Best regards,<br><strong>UK Realty Team</strong></p>
        <p style="font-size:12px;color:#999;margin-top:24px;border-top:1px solid #e5e5e5;padding-top:12px">You're receiving this because you submitted an enquiry on UK Realty.</p>
      </div>
    `,
  });
}

export async function sendNewListingNotifications(listing: {
  id: string;
  title: string;
  price: string;
  area: string;
  city: string;
  propertyType: string;
  imageUrl?: string;
}) {
  if (!isConfigured()) return;

  const { default: prisma } = await import("@/lib/prisma");
  const users = await prisma.user.findMany({ select: { email: true, name: true } });
  if (users.length === 0) return;

  const listingUrl = `${process.env.NEXTAUTH_URL ?? ""}/listings/${listing.id}`;
  const imageHtml = listing.imageUrl
    ? `<img src="${listing.imageUrl}" alt="${listing.title}" style="width:100%;max-height:240px;object-fit:cover;border-radius:4px;margin-bottom:16px" />`
    : "";

  const batchSize = 50;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map((user) =>
        resend.emails.send({
          from: FROM,
          to: user.email,
          subject: `New Listing: ${listing.title}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
              <h2 style="border-bottom:2px solid #000;padding-bottom:8px">New Property Listed</h2>
              <p>Hi ${user.name},</p>
              ${imageHtml}
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr><td style="padding:6px 0;color:#555;width:120px">Property</td><td style="padding:6px 0;font-weight:600">${listing.title}</td></tr>
                <tr><td style="padding:6px 0;color:#555">Type</td><td style="padding:6px 0">${listing.propertyType}</td></tr>
                <tr><td style="padding:6px 0;color:#555">Price</td><td style="padding:6px 0;font-weight:600">${listing.price}</td></tr>
                <tr><td style="padding:6px 0;color:#555">Location</td><td style="padding:6px 0">${listing.area}, ${listing.city}</td></tr>
              </table>
              <a href="${listingUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600;margin-top:8px">View Property</a>
              <p style="font-size:12px;color:#999;margin-top:32px;border-top:1px solid #e5e5e5;padding-top:12px">You're receiving this because you have an account on UK Realty. <a href="${process.env.NEXTAUTH_URL ?? ""}/account" style="color:#555">Manage preferences</a></p>
            </div>
          `,
        })
      )
    );
  }
}
