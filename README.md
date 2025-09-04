PathFinders 🏃‍♂️🌍

Generate suitable running routes based on user preferences — customized to every individual.

Try it out without setup: 👉 PathFinders Web App: https://pathfinders-frontend.onrender.com/

🔧 Getting Started (Local Setup)
1. Clone the Repository
git clone https://github.com/darrensimmx/PathFinders.git
cd PathFinders

2. Install Dependencies
npm run setup

3. Run the Project
npm start


Frontend will run on localhost:5173
Backend will run on localhost:4000

Note: We use CORS since a single port cannot run multiple servers.

🧪 Testing

Install testing dependencies:

npm install --save-dev jest supertest


Make sure your package.json includes:

"scripts": {
  "test": "jest"
}


Run tests:

npm test

⚙️ Additional Setup Notes

Client-side:

npm install react-icons

npm install cypress --save-dev

Backend:

npm install mongoose

npm install bcrypt

npm install --save-dev mongodb-memory-server

npm install jsonwebtoken cookie-parser

npm install nodemailer

Database:

Ensure your IP Address is whitelisted in MongoDB.

🌟 Contributing

We welcome feedback, feature suggestions, and contributions! Feel free to fork the repo, open an issue, or submit a PR.

