import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de react-router-dom
vi.mock('react-router-dom', () => {
  return {
    useNavigate: () => vi.fn(),
    Link: (props) => {
      return {
        type: 'a',
        props: {
          href: props.to,
          children: props.children
        }
      };
    }
  };
});