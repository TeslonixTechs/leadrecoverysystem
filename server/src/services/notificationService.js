/**
 * Notification Service Abstraction
 * Handles multi-channel notifications (Email/SMS/Push) for booking events.
 * For MVP/Demo: Outputs clean formatted console logs and maintains an in-memory audit log.
 * Provider adapter design allows plugging in Twilio/SendGrid/AWS SES without changing domain logic.
 */

const notificationLog = [];

const NotificationService = {
  /**
   * Sends booking confirmation to customer.
   */
  async sendBookingConfirmation(appointment, customer, business) {
    const payload = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipient: customer.email || customer.phone,
      recipientName: customer.name,
      type: 'CUSTOMER_BOOKING_CONFIRMATION',
      channel: customer.email ? 'EMAIL' : 'SMS',
      timestamp: new Date().toISOString(),
      subject: `Service Request Scheduled - ${business.name}`,
      message: `Hi ${customer.name}, your request for ${appointment.service?.name || 'roofing service'} at ${customer.address} has been scheduled for ${appointment.date} with an estimated arrival time of ${appointment.estimatedArrival}. Reference: ${appointment.referenceNumber}.`
    };

    notificationLog.push(payload);
    console.log(`\n=================== [NOTIFICATION LOGGED: CUSTOMER] ===================`);
    console.log(`Channel: ${payload.channel} | To: ${payload.recipientName} (${payload.recipient})`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Body: ${payload.message}`);
    console.log(`========================================================================\n`);

    return payload;
  },

  /**
   * Sends new lead/appointment alert to business owner/dispatch.
   */
  async sendBusinessNewLeadNotification(serviceRequest, appointment, business) {
    const payload = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipient: business.email,
      recipientName: business.name,
      type: 'BUSINESS_NEW_LEAD_ALERT',
      channel: 'EMAIL',
      timestamp: new Date().toISOString(),
      subject: `🚨 NEW BOOKING: ${serviceRequest.customer?.name} - ${appointment.estimatedArrival} ${appointment.date}`,
      message: `New service request received!\nCustomer: ${serviceRequest.customer?.name} (${serviceRequest.customer?.phone})\nAddress: ${serviceRequest.customer?.address}, ${serviceRequest.customer?.city}\nUrgency: ${serviceRequest.urgency}\nProblem: "${serviceRequest.problemDescription}"\nScheduled Arrival: ${appointment.estimatedArrival} on ${appointment.date}\nRef: ${appointment.referenceNumber}`
    };

    notificationLog.push(payload);
    console.log(`\n=================== [NOTIFICATION LOGGED: BUSINESS] ===================`);
    console.log(`Channel: ${payload.channel} | To: Business Dispatch (${payload.recipient})`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Body:\n${payload.message}`);
    console.log(`========================================================================\n`);

    return payload;
  },

  /**
   * Sends appointment update/reschedule alert.
   */
  async sendAppointmentUpdate(appointment, customer, business) {
    const payload = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipient: customer.email || customer.phone,
      recipientName: customer.name,
      type: 'APPOINTMENT_UPDATE',
      channel: customer.email ? 'EMAIL' : 'SMS',
      timestamp: new Date().toISOString(),
      subject: `Appointment Update - ${business.name}`,
      message: `Hi ${customer.name}, your appointment (${appointment.referenceNumber}) has been updated. Status: ${appointment.status}. Arrival: ${appointment.estimatedArrival} on ${appointment.date}.`
    };

    notificationLog.push(payload);
    console.log(`\n[NOTIFICATION LOGGED: UPDATE] -> ${payload.recipientName}: ${payload.message}`);

    return payload;
  },

  /**
   * Retrieves log of sent notifications (for demo testing).
   */
  getNotificationLogs() {
    return [...notificationLog];
  }
};

module.exports = NotificationService;
