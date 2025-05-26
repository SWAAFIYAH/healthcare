export function computeVisitsForPatient(appointments, patientId) {
  const now = new Date();

  // Filter appointments for this patient
  const patientAppointments = appointments
    .filter(a => a.patientId === patientId)
    .map(a => ({
      ...a,
      dateTime: new Date(`${a.date}T${a.time}`),
    }));

  // Last visit: latest completed appointment in the past
  const lastVisit = patientAppointments
    .filter(a => a.dateTime < now && a.status === 'completed')
    .sort((a, b) => b.dateTime - a.dateTime)[0];

  // Next visit: earliest upcoming appointment in the future
  const nextVisit = patientAppointments
    .filter(a => a.dateTime > now && a.status === 'upcoming')
    .sort((a, b) => a.dateTime - b.dateTime)[0];

  return {
    lastvisit: lastVisit ? lastVisit.date : null,
    nextvisit: nextVisit ? nextVisit.date : null,
    nextvisitTime: nextVisit ? nextVisit.time : null,
  };
}