# Third & Aleanna's Wedding RSVP System

A beautiful and functional wedding RSVP website built with React, Firebase, and Cloud Functions.

## 🎉 Features

- **Beautiful Wedding Website** with responsive design
- **Guest RSVP System** with individual and group management
- **Admin Dashboard** for managing guests and RSVPs
- **Email Invitations** sent automatically via Cloud Functions
- **Real-time Data** with Firebase Firestore
- **Secure Authentication** for admin access

## 🚀 Live Website

Visit: [https://yannawedding-11b85.web.app](https://yannawedding-11b85.web.app)

## 🛠 Tech Stack

- **Frontend:** React + Vite
- **Backend:** Firebase (Firestore, Authentication, Storage, Cloud Functions)
- **Styling:** CSS with responsive design
- **Email:** Nodemailer via Cloud Functions
- **Deployment:** Firebase Hosting

## 📧 Email System

Automatic email invitations are sent when guests RSVP "Yes":
- Personalized wedding invitations
- Beautiful HTML template
- Invitation image attachment
- Professional email formatting

## 🎯 Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── services/           # Firebase services
│   ├── context/            # React context
│   └── assets/             # Static assets
├── functions/              # Firebase Cloud Functions
├── dist/                   # Build output
└── firebase.json           # Firebase configuration
```

## 🔧 Admin Access

The admin panel allows:
- Managing guest lists
- Viewing RSVP responses
- Sending email invitations
- Tracking attendance

## 💝 Wedding Details

**Third & Aleanna**  
August 31, 2025  
St. Joseph Parish Church, Manila  
Reception at Radisson Hotel, Manila

---

*Created with love for Third & Aleanna's special day* 💕+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
