import React from "react";
import { ThemeProvider } from "./components/ui/theme-provider";
import BacktestJournal from "./BacktestJournal";
import "./index.css";

function App() {
  return (
    <ThemeProvider>
      <BacktestJournal />
    </ThemeProvider>
  );
}

export default App;
