import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyThemeColors } from './data/colors.ts';

// Apply centralized theme colors to CSS variables
applyThemeColors();

createRoot(document.getElementById('root')!).render(<App />);
