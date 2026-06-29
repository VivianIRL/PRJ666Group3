import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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
      render(<Center/>);

      const signInBtn = screen.getByTestId('top-navbar-sign-in-btn')
    
      expect(signInBtn).toBeDefined();

      await fireEvent(signInBtn,
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
  });

  
    
  it('User can register', async () => {
      render(<Center/>);

      const signUpBtn = screen.getByTestId('top-navbar-sign-up-btn')
    
      expect(signUpBtn).toBeDefined();

      await fireEvent(signUpBtn,
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        }))

      const register = await screen.getByTestId('register')

      expect(register).toBeDefined();
    
      await fireEvent.change(screen.getByTestId('register-first-name-input'), { target: { value: 'Maria' } })
      await fireEvent.change(screen.getByTestId('register-last-name-input'), { target: { value: 'Smith' } })
      await fireEvent.change(screen.getByTestId('register-email-input'), { target: { value: 'mariasmith@gmail.com' } })
      await fireEvent.change(screen.getByTestId('register-dob-input'), { target: { value: '2003-05-20' } })
      await fireEvent.change(screen.getByTestId('register-password-input'), { target: { value: '12345963' } })
      await fireEvent.change(screen.getByTestId('register-confirm-password-input'), { target: { value: '12345963' } })

      const immigrationBtn = screen.getByTestId('register-submit-btn')
    
      expect(immigrationBtn).toBeDefined();

      await fireEvent(immigrationBtn,
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        }))
    
      expect(screen.getByTestId('immigration')).toBeDefined();
  });
});