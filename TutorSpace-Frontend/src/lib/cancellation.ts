/**
 * Client-side preview of the cancellation policy.
 *
 * This mirrors CANCELLATION_WINDOW_HOURS in the backend's booking service. The
 * server is authoritative and re-decides on every request — this exists purely
 * so the confirmation dialog can tell the user what will happen BEFORE they
 * commit to it. Asking someone to confirm an irreversible action without
 * saying whether they get their money back is not a real confirmation.
 *
 * If the two ever drift, the server wins and the user sees the true outcome in
 * the resulting toast.
 */
export const CANCELLATION_WINDOW_HOURS = 24

export const previewCancellation = (
  startTime: string,
  paymentStatus?: string,
  cancelledByTutor = false,
) => {
  const msUntilStart = new Date(startTime).getTime() - Date.now()
  const withinWindow = msUntilStart < CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000
  const wasPaid = paymentStatus === "PAID"

  return {
    withinWindow,
    wasPaid,
    refundable: wasPaid && (cancelledByTutor || !withinWindow),
    windowHours: CANCELLATION_WINDOW_HOURS,
  }
}
