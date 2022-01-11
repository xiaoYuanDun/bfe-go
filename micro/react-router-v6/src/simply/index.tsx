import React from 'react';

import { Link } from 'react-router-dom';

export default function App() {
  return (
    <div>
      <h1>Bookkeeper</h1>
      <nav
        style={{
          borderBottom: 'solid 1px',
          paddingBottom: '1rem',
        }}
      >
        <Link to="/invoices">Invoices</Link> |{' '}
        <Link to="/expenses">Expenses</Link> |{' '}
        {/* <Link to="/parent/s1">Parent</Link> */}
        <Link to="/parent/danny/123">Parent</Link>|{' '}
        <Link to="/parent/son1">son1</Link> |{' '}
        <Link to="/parent/son2">son2</Link> |{' '}
      </nav>
    </div>
  );
}
