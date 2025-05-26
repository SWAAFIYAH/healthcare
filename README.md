# CareRemind

CareRemind is a modern healthtech follow-up reminder system designed for clinics and private doctors to automatically track and remind both doctors and patients of upcoming appointments. Built with React 18, Vite, TailwindCSS, and Material UI, it streamlines patient management and ensures no follow-up is missed.

**Live Demo:** [careremind.netlify.app](https://careremind.netlify.app)

---

## 🚀 Key Features

- **Automated Reminders:**  
  Sends appointment reminders to patients and doctors via email.
- **Patient & Appointment Management:**  
  Add, edit, and view patient details, schedule and manage appointments, and track visit history.
- **Dynamic Visit Tracking:**  
  Last and next visits are computed in real-time from appointment data.
- **Doctor & Hospital Integration:**  
  Assign doctors to appointments and include hospital details in reminders.
- **Customizable Reminder Templates:**  
  Use and edit templates for personalized reminders.
- **Modern UI:**  
  Responsive, user-friendly interface with search and risk filtering.
- **Demo Account:**  
  At the moment, users can only access the system using the demo account.

---

## 🖥️ Live Demo

👉 [careremind.netlify.app](https://careremind.netlify.app)

---

## 📂 Project Structure

```
├── src/
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   ├── components/            # Reusable UI components
│   ├── context/               # React context providers
│   ├── pages/                 # Page-level components
│   ├── services/              # API and utility services
│   └── utils/                 # Utility functions
├── public/                    # Static assets
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── eslint.config.js           # ESLint configuration
```

---

## 🛠️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SWAAFIYAH/healthcare.git
   cd healthcare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**  
   Create a `.env` file and add your Supabase and EmailJS credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

- `npm install` – Install dependencies
- `npm run dev` – Start development server
- `npm run lint` – Lint source files

---

## 👥 Authors

- **Ronnie Kabala**  
  [github.com/kaballah](https://github.com/kaballah)

- **Sofia Salim**  
  [github.com/SWAAFIYAH](https://github.com/SWAAFIYAH)

---

## 📦 Tech Stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Material UI](https://mui.com/)
- [Supabase](https://supabase.com/)
- [EmailJS](https://www.emailjs.com/)
- [ESLint](https://eslint.org/)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- Built for the **HealthTech: Follow-Up Reminder System** hackathon.
- Inspired by the need for better patient follow-up in clinics and private practice.

---
