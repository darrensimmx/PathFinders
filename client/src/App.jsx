// Central base for all the pages

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm'
import RouteGenerator from './components/RouteGenerator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/route-generator" element={<RouteGenerator />}/>
        <Route path="/" element={<LoginForm />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;