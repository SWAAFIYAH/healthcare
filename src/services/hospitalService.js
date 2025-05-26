import supabase from './supabaseClient';

// Fetch hospital details (Aga Khan)
export const getHospital = async () => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('name', 'Aga Khan')
    .single();
  if (error) throw error;
  return data;
};

// Fetch a doctor with no appointments at a given time
export const getAvailableDoctor = async (appointmentDate, appointmentTime) => {
  // Get all doctors
  const { data: doctors, error: docError } = await supabase
    .from('doctors')
    .select('*');
  if (docError) throw docError;

  // Get all appointments at that date/time
  const { data: appointments, error: appError } = await supabase
    .from('appointments')
    .select('doctorId')
    .eq('date', appointmentDate)
    .eq('time', appointmentTime);
  if (appError) throw appError;

  const busyDoctorIds = appointments.map(a => a.doctorId);
  // Find a doctor not in the busy list
  const availableDoctor = doctors.find(doc => !busyDoctorIds.includes(doc.id));
  return availableDoctor;
};