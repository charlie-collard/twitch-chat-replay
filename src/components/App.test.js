import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders the app without crashing', () => {
    render(<App />);
    const element = screen.getByText(/Youtube URL/i);
    expect(element).toBeInTheDocument();
});
