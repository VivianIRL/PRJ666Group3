import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Center from './Center';
import { act } from 'react';

describe('E2E Tests', () => {
  beforeEach(() => {
      vi.clearAllMocks();
      
      localStorage.clear();
  });
    
  async function clickElement(datatestID) {
      const element = screen.getByTestId(datatestID)
    
      expect(element).toBeDefined();

      await act(() => {fireEvent(element,
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
      }))})
  }
  
  async function changeValue(datatestID, input) {
      await act(() => { fireEvent.change(screen.getByTestId(datatestID), { target: { value: input } }) })
  }

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

      await clickElement('top-navbar-sign-in-btn')

      const login = await screen.getByTestId('login')

      expect(login).toBeDefined();
      expect(screen.getByTestId('login-email-address-input')).toBeDefined();
      expect(screen.getByTestId('login-password-input')).toBeDefined();

      const logInSignUpBtn = await screen.getByTestId('login-sign-up-btn')
    
      expect(logInSignUpBtn).toBeDefined();
  });

  it('User can register', async () => {
      render(<Center/>);

      await clickElement('top-navbar-sign-up-btn')

      const register = await screen.getByTestId('register')

      expect(register).toBeDefined();
    
      await changeValue('register-first-name-input', 'Maria')
      await changeValue('register-last-name-input', 'Smith')
      await changeValue('register-email-input', 'mariasmith@gmail.com')
      await changeValue('register-dob-input', '2003-05-20')
      await changeValue('register-password-input', '12345963')
      await changeValue('register-confirm-password-input', '12345963')
      await clickElement('register-submit-btn')
    
      expect(screen.getByTestId('immigration')).toBeDefined();
    
      await changeValue('immigration-status-select', 'Work Permit Holder')
      await changeValue('immigration-province-select', 'Ontario')
      await changeValue('immigration-country-select', 'United Arab Emirates')
      await changeValue('immigration-tests-select', 'IELTS')
      await changeValue('immigration-expiry-year-input', '2026')
      await changeValue('immigration-expiry-month-input', '07')
      await changeValue('immigration-expiry-day-input', '29')
      await changeValue('immigration-arrival-year-input', '2026')
      await changeValue('immigration-arrival-month-input', '06')
      await changeValue('immigration-arrival-day-input', '30')
      await clickElement('immigration-remember-me-checkbox')
      await clickElement('immigration-agreement-checkbox')
      await clickElement('immigration-create-account-btn')

      expect(screen.getByText(/welcome, maria/i)).toBeDefined();
  });

    it('User logs in automatically', async () => { 
        localStorage.setItem("settlecan_user", JSON.stringify({
            "id": "",
            "email": "mariasmith@gmail.com",
            "name": "maria",
            "fullName": "maria smith",
            "immigrationStatus": "Permanent Resident",
            "province": "Ontario",
            "arrivalDate": "2026-06-30",
            "country": "United Arab Emirates",
            "avatar": null
        }));
    
        render(<Center/>);

        await clickElement('top-navbar-dashboard-btn')

        const dashboard = await screen.getByTestId('dashboard')

        expect(dashboard).toBeDefined();
    })

});