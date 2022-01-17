import React from 'react';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';

export default function Expenses() {
  return (
    <main style={{ padding: '1rem 0' }}>
      <h2>Expenses</h2>
      <Routes>
        <Route index element={<div> son defualt</div>} />
        <Route path="/" element={<div> son /</div>} />
        <Route path="/asd" element={<div> son /asd</div>} />
      </Routes>
    </main>
  );
}
