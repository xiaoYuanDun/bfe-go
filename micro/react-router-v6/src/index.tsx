import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';

// 官方例子
// import App from './App';
// import Expenses from './routes/Expenses';
// import Invoices from './routes/Invoices';
// import Invoice from './routes/Invoice';

// const ele = (
//   <BrowserRouter>
//     <Routes>
//       <Route path="/" element={<App />}>
//         <Route path="expenses" element={<Expenses />} />
//         <Route path="invoices" element={<Invoices />}>
//           <Route
//             index
//             element={
//               <main style={{ padding: '1rem' }}>
//                 <p>Select an invoice</p>
//               </main>
//             }
//           />
//           <Route path=":invoiceId" element={<Invoice />} />
//         </Route>
//         <Route
//           path="*"
//           element={
//             <main style={{ padding: '1rem' }}>
//               <p>There's nothing here!</p>
//             </main>
//           }
//         />
//       </Route>
//     </Routes>
//   </BrowserRouter>
// );

// 个人实现用例
import App from './simply';
import Expenses from './simply/Expenses';
import Invoices from './simply/Invoices';
const ele = (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="invoices" element={<Invoices />} />
    </Routes>
  </BrowserRouter>
);

console.log('---');

ReactDOM.render(ele, document.getElementById('root'));
