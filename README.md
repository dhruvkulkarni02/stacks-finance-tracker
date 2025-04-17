# 💸 Stacks – Personal Finance Tracker

Stacks is a fullstack web application for tracking your personal finances, managing goals, and gaining smart insights into your spending habits. Built with modern technologies including **Next.js**, **Tailwind CSS**, **Node.js**, **MongoDB**, and **OpenAI API**, it’s designed to be clean, intuitive, and intelligent.

---

## 📁 Project Structure

```
stacks/
├── client/                   # Frontend Next.js application
│   ├── app/                  # Next.js App Router
│   ├── components/           # UI, layout, transactions, charts, etc.
│   ├── lib/                  # API helpers and utilities
│   ├── types/                # Shared TypeScript types
│   └── public/               # Static assets
│
├── server/                   # Backend Node.js + Express application
│   ├── src/                  # Source files: models, routes, controllers
│   ├── data/                 # Mock data and seed scripts
│
└── README.md                 # Project documentation
```

---

## 🚀 Tech Stack

### Frontend
- ⚛️ **Next.js 13+ (App Router)**
- 🎨 **Tailwind CSS**
- 🔐 Optional: Firebase or JWT Auth
- 📈 Charting: **Chart.js** or **Recharts**

### Backend
- 🧠 **Node.js + Express**
- 🗃️ **MongoDB + Mongoose**
- 🤖 **OpenAI API** integration (AI-powered spending insights)

---

## 🧩 Core Features

- ✅ Track income and expenses
- ✅ Set and manage saving goals
- ✅ Visualize spending via charts
- ✅ AI-powered transaction summaries
- ✅ Optional auth system
- ✅ Responsive and minimal UI

---

## 🛠 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stacks-finance-tracker.git
cd stacks
```

### 2. Install Dependencies

```bash
# For client
cd client
npm install

# For server
cd ../server
npm install
```

### 3. Setup Environment Variables

Copy the example files and fill in your credentials:

```bash
cp client/.env.local.example client/.env.local
cp server/.env.example server/.env
```

### 4. Run the App

```bash
# Run backend
cd server
npm run dev

# Run frontend
cd ../client
npm run dev
```

---

## 📬 Contributions

Pull requests are welcome! Let’s build something great together.

---

## 📄 License

This project is open-source under the MIT License.
