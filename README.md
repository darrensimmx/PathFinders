# PathFinders
Generate suitable running routes based on user preferences, customized to individual users

Current Progress:
- BackEnd has the basic logic for frontend to use. 
- Should have the process of taking in input, giving an output on terminal and handling errors
- Further logic that depends on routing API will be added later

## 🔧 Getting Started (Local Setup)
1. **Clone the repo**
   ```bash
   git clone https://github.com/darrensimmx/PathFinders.git
   OR
   git pull
2. **Install Dependencies**
    cd client
    npm install
    cd ../BackEnd/server
    npm install
3. **Run the Project**
   In seperate terminals:
   - FrontEnd
     cd client
     npm run dev
   - BackEnd
     cd BackEnd/server
     npm run dev

**Local Host**
FrontEnd should run on localhost:5173 while BackEnd runs on localhost:4000 
=> we don't use same host as one port can only run one server (hence the use of cors to integrate the different hosts)
