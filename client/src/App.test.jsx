import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from './App';

jest.mock('axios');

describe('App component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
      console.log(`axios.get called with URL: ${url}`);
      return Promise.resolve({
        data: [
          {
            time: '2023-05-01T00:00:00Z',
            data: {
              instant: {
                details: {
                  air_temperature: 15,
                  air_pressure_at_sea_level: 1012,
                  relative_humidity: 60,
                  wind_speed: 5,
                  wind_from_direction: 180,
                  cloud_area_fraction: 20,
                },
              },
              next_12_hours: {
                summary: {
                  symbol_code: 'partly_cloudy',
                },
              },
            },
          },
        ],
      });
    });
  });

  test('renders the component and checks initial state', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText(/Weather Forecast/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter location/i)).toHaveValue('Moscow');
    expect(screen.getByPlaceholderText(/Enter latitude/i)).toHaveValue(55.7558);
    expect(screen.getByPlaceholderText(/Enter longitude/i)).toHaveValue(37.6176);
    expect(axios.get).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText(/Temperature/i)).toBeInTheDocument());
  });

  test('changes coordinates and fetches new weather data', async () => {
    await act(async () => {
      render(<App />);
    });

    const latInput = screen.getByPlaceholderText(/Enter latitude/i);
    const lonInput = screen.getByPlaceholderText(/Enter longitude/i);
    const fetchButton = screen.getAllByText(/Fetch Weather/i)[1];

    fireEvent.change(latInput, { target: { value: 40.7128 } });
    fireEvent.change(lonInput, { target: { value: -74.006 } });
    fireEvent.click(fetchButton);

    console.log('Coordinates changed and fetch button clicked');

    await waitFor(() => {
      expect(axios.get).toHaveBeenNthCalledWith(2,
        expect.stringContaining('lat=40.7128&lon=-74.006')
      );
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('toggles language', async () => {
    await act(async () => {
      render(<App />);
    });

    const toggleButton = screen.getByText(/EN/i);

    fireEvent.click(toggleButton);

    console.log('Language toggled');

    expect(screen.getByText(/Прогноз погоды/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Введите местоположение/i)).toBeInTheDocument();
  });

  test('displays loading spinner when fetching data', async () => {
    axios.get.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: [] }), 200)));

    await act(async () => {
      render(<App />);
    });

    const locationInput = screen.getByPlaceholderText(/Enter location/i);
    const fetchButton = screen.getAllByText(/Fetch Weather/i)[0];

    fireEvent.change(locationInput, { target: { value: 'New York' } });
    fireEvent.click(fetchButton);

    console.log('Fetching data and expecting spinner to be displayed');

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
