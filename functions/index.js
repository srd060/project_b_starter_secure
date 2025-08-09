
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Helper: apply payment to agent pending daily logs oldest-first
async function applyPaymentToAgent(vehicleId, agentIdentifier, amount) {
  if (!amount || amount <= 0) return 0;
  const dailyRef = admin.firestore().collection('daily_log');
  const q = dailyRef.where('vehicleId','==', vehicleId).where('agent','==', agentIdentifier).orderBy('createdAt','asc');
  const snap = await q.get();
  let remaining = amount;
  const batch = admin.firestore().batch();
  for (const doc of snap.docs) {
    if (remaining <= 0) break;
    const d = doc.data();
    const pending = Number(d.amount_pending || 0);
    if (pending <= 0) continue;
    const deduction = Math.min(remaining, pending);
    remaining -= deduction;
    const docRef = doc.ref;
    batch.update(docRef, { amount_paid: admin.firestore.FieldValue.increment(deduction), amount_pending: pending - deduction });
  }
  if (!batch._ops || batch._ops.length === 0) {
    // No updates
  } else {
    await batch.commit();
  }
  return remaining; // return leftover amount (if any)
}

// Trigger when a pipe entry is created
exports.onPipeEntryCreated = functions.firestore.document('pipe_entries/{docId}').onCreate(async (snap, ctx) => {
  const data = snap.data();
  if (!data) return null;
  try {
    const amountPaid = Number(data.amount_paid || 0);
    if (data.paid_by_type === 'agent' && data.paid_by_agentId) {
      // apply payment to agent's pending daily logs
      const leftover = await applyPaymentToAgent(data.vehicleId, data.paid_by_agentId, amountPaid);
      // if leftover > 0, create a credit note or GL entry indicating overpayment (not implemented fully)
      if (leftover > 0) {
        await admin.firestore().collection('general_ledger').add({
          vehicleId: data.vehicleId,
          date: admin.firestore.Timestamp.now(),
          type: 'Overpayment',
          referenceId: ctx.params.docId,
          debit: 0,
          credit: amountPaid - leftover,
          note: 'Overpayment by agent ' + data.paid_by_agentId,
          createdAt: admin.firestore.Timestamp.now()
        });
      }
    }
    // Always create inventory inflow record for pipes is implicit via pipe_entries collection usage
    return null;
  } catch (e) {
    console.error('onPipeEntryCreated error', e);
    return null;
  }
});

// Trigger when a daily_log is created, create a GL entry
exports.onDailyLogCreated = functions.firestore.document('daily_log/{docId}').onCreate(async (snap, ctx) => {
  const data = snap.data();
  if (!data) return null;
  try {
    await admin.firestore().collection('general_ledger').add({
      vehicleId: data.vehicleId,
      date: data.date || admin.firestore.Timestamp.now(),
      type: 'DailyJob',
      referenceId: snap.id,
      debit: 0,
      credit: Number(data.total_amount || 0),
      createdAt: admin.firestore.Timestamp.now()
    });
  } catch (e) {
    console.error('onDailyLogCreated error', e);
  }
  return null;
});
