import React, { useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout, Progress } from '@/components';

// Lazy load the pages
const Home = lazy(() => import('@/pages/Home'));
const Users = lazy(() => import('@/pages/users'));
const PoliceMen = lazy(() => import('@/pages/policemen'));
const PoliceMenForm = lazy(() => import('@/pages/policemen/add-update'));

const Settings = lazy(() => import('@/pages/Settings'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const Login = lazy(() => import('@/pages/Login'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function App() {

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedFontSize = JSON.parse(localStorage.getItem('font-size') || '{"value": "22"}');

    document.documentElement.classList.toggle('dark', savedDarkMode);
    document.documentElement.style.fontSize = `${savedFontSize.value}px`
  }, []);

  return (
    <div className=''>
      <Router>
      <Suspense fallback={<Progress />}>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/view" element={<Home view={true} />} />
          <Route path="/users" element={<Layout><Users /></Layout>} />

          <Route path="/policemen" element={<Layout><PoliceMen /></Layout>} />
          <Route path="/policemen/add" element={<Layout><PoliceMenForm /></Layout>} />
          <Route path="/policemen/edit/:id" element={<Layout><PoliceMenForm /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
    </div>
  );
}

export default App;
