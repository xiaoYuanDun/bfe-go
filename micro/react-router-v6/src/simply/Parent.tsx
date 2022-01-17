import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Parent() {
  console.log('parent,,,');
  return (
    <main style={{ padding: '1rem 0' }}>
      <h2>Parent</h2>
      <Outlet />
    </main>
  );
}
