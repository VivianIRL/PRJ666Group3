import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { StrictMode } from 'react';
import { AuthProvider } from './state/AuthProvider';
import { NotificationsProvider } from './state/NotificationsProvider';
import { BrowserRouter } from 'react-router-dom';
import TopNavbar from './navigation/top-navbar';

describe('App Entire Render', () => {
  it('finds global app content', async () => {
    render(
  <StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <TopNavbar />
          <App />
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  </StrictMode>);

    expect(screen.getByText(/welcome to settlecan/i)).toBeDefined();
  });
});