// Central base for all the pages

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import RouteGenerator from './components/RouteGenerator';
import ForgotPassword from './components/ForgotPassword';

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