import React, {StrictMode} from 'react';
import './index.css';
import App from "./components/App";
import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<StrictMode><App /></StrictMode>);