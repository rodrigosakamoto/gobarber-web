import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import api from '../../services/api';
import ResetPassword from '../../pages/ResetPassword';

const mockedHistoryPush = jest.fn();
const mockedAddToast = jest.fn();
const apiMock = new MockAdapter(api);
let mockedLocation = 'jwt-token';

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    useLocation: () => ({
      search: mockedLocation,
    }),
  };
});

jest.mock('../../hooks/toast', () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

describe('ResetPassword Page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
    mockedAddToast.mockClear();
  });

  it('should be able to reset the password', async () => {
    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    apiMock.onPost('/password/reset').replyOnce(200);

    const passwordField = getByPlaceholderText('Nova senha');
    const confirmPasswordField = getByPlaceholderText('Confirmação da senha');
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordField, { target: { value: '123456' } });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith('/');
    });
  });

  it('should not be able to reset password without token', async () => {
    mockedLocation = '';
    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    apiMock.onPost('/password/reset').replyOnce(200);

    const passwordField = getByPlaceholderText('Nova senha');
    const confirmPasswordField = getByPlaceholderText('Confirmação da senha');
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordField, { target: { value: '123456' } });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalledWith('/');
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        }),
      );
    });
  });

  it('should not be able to reset password with invalid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('Nova senha');
    const confirmPasswordField = getByPlaceholderText('Confirmação da senha');
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordField, {
      target: { value: 'not-valid-password' },
    });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalledWith('/');
    });
  });
});
