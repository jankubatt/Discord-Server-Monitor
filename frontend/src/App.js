import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage, UserPage } from "./pages";

function App() {
  return (
    <BrowserRouter>
      	<Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/u/:user" element={<UserPage />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
