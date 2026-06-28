import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import Center from './Center';

describe('E2E Tests', () => {
  it('Welcomes the user', async () => {
      render(<Center/>);

      expect(screen.getByText(/welcome to settlecan/i)).toBeDefined();
  });
    
  it('Basic user functions are available', async () => {
      render(<Center/>);


      expect(screen.getByTestId('top-navbar-about-btn')).toBeDefined();
      expect(screen.getByTestId('top-navbar-contact-btn')).toBeDefined();
      expect(screen.getByTestId('top-navbar-sign-up-btn')).toBeDefined();
      expect(screen.getByTestId('top-navbar-sign-in-btn')).toBeDefined();
  });
    
  it('User can see sign-in screen', async () => {
      const user = userEvent.setup();
      
      render(<Center/>);

      const signUpBtn = screen.getByTestId('top-navbar-sign-in-btn')
    
      expect(signUpBtn).toBeDefined();

      await fireEvent(signUpBtn,
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        }))

      const login = await screen.getByTestId('login')

      expect(login).toBeDefined();
      expect(screen.getByTestId('login-email-address-input')).toBeDefined();
      expect(screen.getByTestId('login-password-input')).toBeDefined();

      const logInSignUpBtn = await screen.getByTestId('login-sign-up-btn')
    
      expect(logInSignUpBtn).toBeDefined();

      await user.click(logInSignUpBtn)
  });
});