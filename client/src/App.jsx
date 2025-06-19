// Central base for all the pages

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import RouteGenerator from './components/RouteGenerator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/route-generator" element={<RouteGenerator />}/>
        <Route path="/" element={<LoginForm />}/>
        <Route path="/register" element={<RegisterForm />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;