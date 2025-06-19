# PathFinders
Generate suitable running routes based on user preferences, customized to individual users

Current Progress:
- Integrated Frontend and Backend for Milestone 1
- Routing logic for loop routes and Point-to-Point routes
- Improved accuracy (prevention of non-walkable routes and restricted areas)

## 🔧 Getting Started (Local Setup)
1. **Clone the repo**
   ```bash
   git clone https://github.com/darrensimmx/PathFinders.git
   OR
   git pull
2. **Install Dependencies**
    - npm run setup
3. **Run the Project**
    - npm start 
   
Testing:
- npm install --save-dev jest supertest
- ensure that in packagejson, under "scripts", there is "test": "jest". Else, add it in.




**Local Host**
FrontEnd should run on localhost:5173 while BackEnd runs on localhost:4000 
=> we don't use same host as one port can only run one server (hence the use of cors to integrate the different hosts)


- client side might need to npm install react-icons
- client side might need to npm install cypress --save-dev
- BackEnd.server might need to npm install mongoose
- Backend server might need npm i bcrypt
- Backend server might need npm install --save-dev mongodb-memory-server

