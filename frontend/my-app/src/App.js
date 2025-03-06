import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "./UploadPage"; // Your new upload page
import MainPage from "./MainPage"; // Your chatbot page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
