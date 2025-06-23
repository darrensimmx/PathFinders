// Central base for all the pages

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm'
import RegisterForm from './components//Auth/RegisterForm'
import ForgotPassword from './components/Auth/ForgotPassword';
import RouteGenerator from './components/Route/RouteGenerator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/route-generator" element={<RouteGenerator />}/>
        <Route path="/" element={<LoginForm />}/>
        <Route path="/register" element={<RegisterForm />}/>
        <Route path="/forgot-password" element={<ForgotPassword />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;