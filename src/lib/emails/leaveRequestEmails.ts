/**
 * Transactional e-mail templates for the leave request lifecycle.
 *
 * Inline HTML (same table-based style as the other transactional e-mails) kept
 * in one place, so the actions never duplicate subjects or markup. Delivery is
 * handled by `@/lib/sendEmail` — this module only builds subject + body.
 */

import dayjs from "dayjs";

import { getLeaveTypeLabel } from "@/constants/leaveTypes";
import type { ILeaveRequest } from "@/db/models/LeaveRequest";
import { computeLeaveDaysRequested } from "@/utils/workingDays";

const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export interface EmailTemplate {
  subject: string;
  html: string;
}

/** Fields needed to render a leave request e-mail — mapped from the document. */
export type LeaveRequestEmailSource = Pick<
  ILeaveRequest,
  | "startDate"
  | "endDate"
  | "startHalfDay"
  | "endHalfDay"
  | "type"
  | "comment"
  | "rejectionReason"
  | "employeeName"
  | "departmentName"
  | "managerName"
  | "reviewedByName"
> & { _id: unknown };

/** Flat view-model the templates work with. */
export interface LeaveRequestEmailData {
  id: string;
  startDate: string;
  endDate: string;
  startHalfDay: boolean;
  endHalfDay: boolean;
  type: LeaveRequestEmailSource["type"];
  comment?: string;
  rejectionReason?: string | null;
  employeeName?: string;
  departmentName?: string;
  managerName?: string;
  reviewedByName?: string;
}

/** Maps a LeaveRequest document to the data required by the templates. */
export function toLeaveRequestEmailData(
  request: LeaveRequestEmailSource,
): LeaveRequestEmailData {
  return {
    id: String(request._id),
    startDate: request.startDate,
    endDate: request.endDate,
    startHalfDay: request.startHalfDay ?? false,
    endHalfDay: request.endHalfDay ?? false,
    type: request.type,
    comment: request.comment,
    rejectionReason: request.rejectionReason,
    employeeName: request.employeeName,
    departmentName: request.departmentName,
    managerName: request.managerName,
    reviewedByName: request.reviewedByName,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(date: string): string {
  return dayjs(date).format("MMM D, YYYY");
}

function formatDateRange(startDate: string, endDate: string): string {
  return startDate === endDate
    ? formatDate(startDate)
    : `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

/**
 * Working days of the request. Derived from the stored range — bank holidays and
 * company closures are rejected when the request is created, so they are never
 * part of a stored request.
 */
function requestedDays(data: LeaveRequestEmailData): number {
  return computeLeaveDaysRequested(
    data.startDate,
    data.endDate,
    data.startHalfDay,
    data.endHalfDay,
  );
}

function detailRow(label: string, value: string): string {
  return `
                            <tr>
                                <td style="padding: 4px 0; font-size: 14px; color: #94a3b8; vertical-align: top; width: 130px;">${label}</td>
                                <td style="padding: 4px 0; font-size: 14px; color: #1a1a2e; font-weight: 600;">${value}</td>
                            </tr>`;
}

interface LayoutOptions {
  heading: string;
  intro: string;
  details: string[];
  ctaLabel: string;
  ctaUrl: string;
  note?: string;
}

/** Shared shell for every leave request e-mail (same look as the other mailers). */
function renderLayout({
  heading,
  intro,
  details,
  ctaLabel,
  ctaUrl,
  note,
}: LayoutOptions): string {
  const detailRows = details.filter(Boolean).join("");
  const noteHtml = note
    ? `
                            <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 24px 0 0;">${note}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 40px 48px 32px;">
                            <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px;">${heading}</h1>
                            <p style="font-size: 16px; color: #64748b; line-height: 1.5; margin: 0 0 24px;">${intro}</p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">${detailRows}
                            </table>
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="background-color: #228be6; border-radius: 6px; padding: 12px 32px;">
                                        <a href="${ctaUrl}" style="color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block;">${ctaLabel}</a>
                                    </td>
                                </tr>
                            </table>${noteHtml}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 48px; border-top: 1px solid #e2e8f0;">
                            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Off Work — Leave management made simple</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

/** Manager notification: a new request awaiting review. */
export function buildNewLeaveRequestEmail(
  data: LeaveRequestEmailData,
): EmailTemplate {
  const employeeName = data.employeeName?.trim() || "An employee";
  const managerName = data.managerName?.trim();
  const leaveType = getLeaveTypeLabel(data.type);
  const comment = data.comment?.trim();

  return {
    subject: `New leave request from ${employeeName} — ${formatDate(data.startDate)} to ${formatDate(data.endDate)}`,
    html: renderLayout({
      heading: "New leave request 📝",
      intro: `${managerName ? `Hi ${escapeHtml(managerName)}, ` : ""}${escapeHtml(employeeName)} submitted a leave request that needs your review.`,
      details: [
        detailRow("Employee", escapeHtml(employeeName)),
        data.departmentName
          ? detailRow("Department", escapeHtml(data.departmentName))
          : "",
        detailRow("Leave type", escapeHtml(leaveType)),
        detailRow(
          "Dates",
          escapeHtml(formatDateRange(data.startDate, data.endDate)),
        ),
        detailRow("Working days", String(requestedDays(data))),
        comment ? detailRow("Note", escapeHtml(comment)) : "",
      ],
      ctaLabel: "Review request",
      ctaUrl: `${BASE_URL}/team/leave-requests/${data.id}`,
      note: "You can approve or decline this request from the team leave requests page.",
    }),
  };
}

/** Employee notification: the request has been approved. */
export function buildLeaveRequestApprovedEmail(
  data: LeaveRequestEmailData,
): EmailTemplate {
  const leaveType = getLeaveTypeLabel(data.type);

  return {
    subject: "Your leave request has been approved ✅",
    html: renderLayout({
      heading: "Your leave request has been approved ✅",
      intro: `Good news — your leave request has been approved.`,
      details: [
        detailRow("Leave type", escapeHtml(leaveType)),
        detailRow(
          "Dates",
          escapeHtml(formatDateRange(data.startDate, data.endDate)),
        ),
        detailRow("Working days", String(requestedDays(data))),
        data.reviewedByName
          ? detailRow("Reviewed by", escapeHtml(data.reviewedByName))
          : "",
      ],
      ctaLabel: "View request",
      ctaUrl: `${BASE_URL}/me/leave-requests/${data.id}`,
      note: "Enjoy your time off!",
    }),
  };
}

/** Employee notification: the request has been declined. */
export function buildLeaveRequestRejectedEmail(
  data: LeaveRequestEmailData,
): EmailTemplate {
  const leaveType = getLeaveTypeLabel(data.type);
  const reason = data.rejectionReason?.trim();

  return {
    subject: "Your leave request has been declined",
    html: renderLayout({
      heading: "Your leave request has been declined",
      intro: `Your leave request was not approved.`,
      details: [
        detailRow("Leave type", escapeHtml(leaveType)),
        detailRow(
          "Dates",
          escapeHtml(formatDateRange(data.startDate, data.endDate)),
        ),
        detailRow("Working days", String(requestedDays(data))),
        reason ? detailRow("Reason", escapeHtml(reason)) : "",
        data.reviewedByName
          ? detailRow("Reviewed by", escapeHtml(data.reviewedByName))
          : "",
      ],
      ctaLabel: "View request",
      ctaUrl: `${BASE_URL}/me/leave-requests/${data.id}`,
      note: "If you have any questions, please contact your manager.",
    }),
  };
}

/** Manager notification: the employee cancelled their own request. */
export function buildLeaveRequestCancelledEmail(
  data: LeaveRequestEmailData,
): EmailTemplate {
  const employeeName = data.employeeName?.trim() || "An employee";
  const leaveType = getLeaveTypeLabel(data.type);

  return {
    subject: `Leave request cancelled by ${employeeName}`,
    html: renderLayout({
      heading: "Leave request cancelled",
      intro: `${escapeHtml(employeeName)} cancelled their leave request.`,
      details: [
        detailRow("Employee", escapeHtml(employeeName)),
        detailRow("Leave type", escapeHtml(leaveType)),
        detailRow(
          "Dates",
          escapeHtml(formatDateRange(data.startDate, data.endDate)),
        ),
        detailRow("Working days", String(requestedDays(data))),
      ],
      ctaLabel: "View request",
      ctaUrl: `${BASE_URL}/team/leave-requests/${data.id}`,
      note: "No action is needed — this request is now cancelled.",
    }),
  };
}
