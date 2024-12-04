import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TeacherView } from './components/TeacherView';
import { PlayView } from './components/PlayView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/teacher" element={<TeacherView />} />
        <Route path="/play" element={<PlayView />} />
        <Route path="/" element={<Navigate to="/teacher" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
