import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ContactUsSidebar from '../src/components/Layout/Sidebar/ContactUsSidebar';
import '@testing-library/jest-dom';

test('renders Contact Us default view with general feedback', () => {
  render(<ContactUsSidebar user={{ name: 'John' }} setActiveView={() => {}} />);

  expect(screen.getByText(/Feedback Type/)).toBeInTheDocument();
  expect(screen.getByText(/General Feedback/).previousSibling).toBeChecked();
});

test('switching to route feedback shows route name input', () => {
  render(<ContactUsSidebar user={{ name: 'John' }} setActiveView={() => {}} />);

  const routeRadio = screen.getByText(/Route Feedback/).previousSibling;
  fireEvent.click(routeRadio);

  expect(screen.getByText(/Route Name/)).toBeInTheDocument();
});

test('Send Feedback button renders', () => {
  render(<ContactUsSidebar user={{ name: 'John' }} setActiveView={() => {}} />);
  expect(screen.getByText(/Send Feedback/)).toBeInTheDocument();
});



