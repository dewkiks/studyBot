import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "./UploadPage"; // Your new upload page
import MainPage from "./MainPage"; // Your chatbot page
import QuizPage from "./QuizPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
