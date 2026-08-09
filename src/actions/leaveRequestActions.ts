"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { getOrganizationId } from "@/utils/getOrganizationId";

dayjs.extend(isSameOrBefore);

async function getBankHolidays(year: number): Promise<string[]> {
  try {
    const res = await fetch("https://gov.uk/bank-holidays.json");
    const data = await res.json();
    const englandHolidays = data["england-and-wales"].events;
    return englandHolidays.map((event: { date: string }) => event.date);
  } catch (error) {
    return [];
  }
}

interface CreateLeaveRequestInput {
  employee: string;
  startDate: string; // Format "YYYY-MM-DD"
  endDate: string;   // Format "YYYY-MM-DD"
}

export async function createLeaveRequest(data: CreateLeaveRequestInput) {
  await connectDB();

  const { employee, startDate, endDate } = data;

  const start = dayjs(startDate, "YYYY-MM-DD");
  const end = dayjs(endDate, "YYYY-MM-DD");

  if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
    return { error: "Invalid date range" };
  }

  const bankHolidays = await getBankHolidays(start.year());

  const datesToRequest: string[] = [];
  let current = start;

  while (current.isSameOrBefore(end, "day")) {
    const dayOfWeek = current.day();
    const formattedDate = current.format("YYYY-MM-DD");

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isBankHoliday = bankHolidays.includes(formattedDate);

    if (!isWeekend && !isBankHoliday) {
      datesToRequest.push(formattedDate);
    }

    current = current.add(1, "day");
  }

  if (datesToRequest.length === 0) {
    return { error: "Selected range contains no working days" };
  }

  const organizationId = await getOrganizationId();

  const existingConflict = await LeaveRequest.findOne({
    employee,
    status: { $in: ["pending", "approved"] },
    dates: { $in: datesToRequest },
    organizationId,
  });

  if (existingConflict) {
    return { error: "Selected dates overlap with an existing request" };
  }

  const newRequest = await LeaveRequest.create({
    employee,
    dates: datesToRequest,
    daysRequested: datesToRequest.length,
    status: "pending",
    organizationId,
  });

  return { success: true, requestId: newRequest._id.toString() };
}