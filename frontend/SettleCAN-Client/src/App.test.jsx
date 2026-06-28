import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { StrictMode } from 'react';
import { AuthProvider } from './state/AuthProvider';
import { NotificationsProvider } from './state/NotificationsProvider';
import { BrowserRouter, Routes } from 'react-router-dom';
import TopNavbar from './navigation/top-navbar';
import userEvent from '@testing-library/user-event';

describe('E2E Tests', () => {
  it('Welcomes the user', async () => {
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
    
  it('Basic user functions are available', async () => {
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


      expect(screen.getByTestId('top-navbar-about-btn')).toBeDefined();
      expect(screen.getByTestId('top-navbar-contact-btn')).toBeDefined();
      expect(screen.getByTestId('top-navbar-sign-up-btn')).toBeDefined();
      expect(screen.getByTestId('top-navbar-sign-in-btn')).toBeDefined();
  });
    
  it('User can see sign-in screen', async () => {
      const user = userEvent.setup();
      
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

      const signUpBtn = screen.getByTestId('top-navbar-sign-in-btn')
    
      expect(signUpBtn).toBeDefined();

      user.click(signUpBtn)

      const login = await screen.getByTestId('login')

      expect(login).toBeDefined();
      expect(screen.getByTestId('login-email-address-input')).toBeDefined();
      expect(screen.getByTestId('login-password-input')).toBeDefined();

      const logInSignUpBtn = await screen.getByTestId('login-sign-up-btn')
    
      expect(logInSignUpBtn).toBeDefined();

      await user.click(logInSignUpBtn)
  });
});