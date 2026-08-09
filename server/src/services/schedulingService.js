const prisma = require('../config/prisma');

/**
 * Helper: Converts "HH:MM" (24h) string to total minutes from midnight.
 * e.g., "08:00" -> 480, "14:10" -> 850, "16:00" -> 960
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Helper: Converts total minutes from midnight to 24h "HH:MM" string.
 * e.g., 960 -> "16:00"
 */
function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  return `${hStr}:${mStr}`;
}

/**
 * Helper: Formats 24h "HH:MM" string to 12h display string ("4:00 PM").
 */
function format12Hour(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Helper: Returns day of week integer (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * for a "YYYY-MM-DD" string.
 */
function getDayOfWeekForDateStr(dateStr) {
  // Append T00:00:00 to avoid UTC shifting
  const d = new Date(`${dateStr}T00:00:00`);
  return d.getDay();
}

/**
 * Helper: Adds N days to "YYYY-MM-DD" and returns new "YYYY-MM-DD".
 */
function addDaysToDateStr(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Finds the earliest available appointment slot for a given business, service, and date.
 * 
 * @param {Object} params
 * @param {string} params.businessId
 * @param {string} params.serviceId
 * @param {string} params.requestedDate - "YYYY-MM-DD"
 * @param {string|Date} [params.currentTimeOverride] - Optional "HH:MM" or ISO string for test simulation
 * @returns {Promise<Object>} Slot details or throws error if invalid
 */
async function findEarliestAvailableSlot({ businessId, serviceId, requestedDate, currentTimeOverride = null }) {
  // 1. Retrieve Service
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true }
  });
  if (!service) {
    throw new Error('Selected service not found or inactive.');
  }

  // 2. Retrieve Business configuration
  const business = await prisma.business.findUnique({
    where: { id: businessId }
  });
  if (!business) {
    throw new Error('Business not found.');
  }

  const duration = service.durationMinutes;
  const buffer = business.travelBufferMinutes || 30;

  // Establish base date and current time constraint
  const todayStr = new Date().toISOString().split('T')[0];
  let currentDateToScan = requestedDate || todayStr;

  // Determine current time in minutes if scanning today's date
  let currentTimeMinutes = -1;
  if (currentTimeOverride) {
    if (typeof currentTimeOverride === 'string' && currentTimeOverride.includes(':') && !currentTimeOverride.includes('T')) {
      currentTimeMinutes = timeToMinutes(currentTimeOverride);
    } else {
      const overrideDate = new Date(currentTimeOverride);
      currentTimeMinutes = overrideDate.getHours() * 60 + overrideDate.getMinutes();
    }
  } else {
    const now = new Date();
    currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
  }

  // Scan up to 14 consecutive days to find earliest slot
  const MAX_DAYS_TO_SCAN = 14;

  for (let dayOffset = 0; dayOffset < MAX_DAYS_TO_SCAN; dayOffset++) {
    const targetDateStr = addDaysToDateStr(currentDateToScan, dayOffset);
    const dayOfWeek = getDayOfWeekForDateStr(targetDateStr);

    // 3. Load Business Hours for this day of week
    const businessHours = await prisma.businessHours.findUnique({
      where: {
        businessId_dayOfWeek: {
          businessId,
          dayOfWeek
        }
      }
    });

    if (!businessHours || !businessHours.isOpen) {
      // Day is closed, continue to next day
      continue;
    }

    const openMinutes = timeToMinutes(businessHours.openTime);
    const closeMinutes = timeToMinutes(businessHours.closeTime);

    // 4. Load Blocked Times for this date
    const blockedTimes = await prisma.blockedTime.findMany({
      where: {
        businessId,
        date: targetDateStr
      }
    });

    // 5. Load Existing Active Appointments for this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        businessId,
        date: targetDateStr,
        status: { not: 'CANCELLED' }
      }
    });

    // Determine candidate start boundaries for target day
    let candidateStart = openMinutes;

    // If scanning the requested initial day and it's today, enforce current time constraint
    if (targetDateStr === requestedDate && currentTimeMinutes > 0) {
      // Candidate must start at least currentTime + buffer (or next 30-min block)
      const earliestAllowed = currentTimeMinutes + buffer;
      if (earliestAllowed > candidateStart) {
        // Round up candidateStart to nearest 30-minute block
        candidateStart = Math.ceil(earliestAllowed / 30) * 30;
      }
    }

    // Iterate through candidate slots in 30-minute steps
    const STEP = 30;

    while (candidateStart + duration <= closeMinutes) {
      const candidateEnd = candidateStart + duration;

      let isSlotValid = true;

      // Check conflict with Blocked Times
      for (const block of blockedTimes) {
        const bStart = timeToMinutes(block.startTime);
        const bEnd = timeToMinutes(block.endTime);

        // Overlap condition: candidate slot overlaps blocked time
        if (candidateStart < bEnd && candidateEnd > bStart) {
          isSlotValid = false;
          break;
        }
      }

      if (!isSlotValid) {
        candidateStart += STEP;
        continue;
      }

      // Check conflict with Existing Appointments (including travel buffer)
      for (const app of existingAppointments) {
        const appStart = timeToMinutes(app.startTime);
        const appEnd = timeToMinutes(app.endTime);

        // Required buffer window around appointment
        // An existing appointment prevents new appointment starts between (appStart - buffer - duration) and (appEnd + buffer)
        const appBufferStart = appStart - buffer;
        const appBufferEnd = appEnd + buffer;

        if (candidateStart < appBufferEnd && candidateEnd > appBufferStart) {
          isSlotValid = false;
          break;
        }
      }

      if (isSlotValid) {
        // Valid slot found!
        const startTimeStr = minutesToTime(candidateStart);
        const endTimeStr = minutesToTime(candidateEnd);
        const arrivalDisplay = format12Hour(startTimeStr);

        return {
          available: true,
          date: targetDateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          estimatedArrival: arrivalDisplay,
          durationMinutes: duration,
          travelBufferMinutes: buffer,
          isNextBusinessDay: targetDateStr !== requestedDate,
          serviceName: service.name
        };
      }

      candidateStart += STEP;
    }
  }

  // If no slot found within 14 days
  return {
    available: false,
    message: 'No available appointment slots found within the next 14 business days.'
  };
}

module.exports = {
  findEarliestAvailableSlot,
  timeToMinutes,
  minutesToTime,
  format12Hour,
  getDayOfWeekForDateStr
};
