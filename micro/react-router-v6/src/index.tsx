import React, { createContext, useContext } from 'react';
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
import Parent from './simply/Parent';
import Son1 from './simply/Son1';
import Son2 from './simply/Son2';

// const ele = (
//   <BrowserRouter>
//     {/* <Routes>
//       <Route path="/" element={<App />} />
//       <Route path="expenses" element={<Expenses />} />
//       <Route path="invoices" element={<Invoices />} />
//       <Route path="parent" element={<Parent />}>
//         <Route index element={<div>parent - son - default</div>} />
//         <Route path="s1" element={<div>parent - son - 1</div>} />
//       </Route>
//       <Route path="parent/:name/:id/*" element={<div> U know it</div>} />
//     </Routes> */}
//     <Routes>
//       <Route path="/" element={<App />} />
//       <Route path="expenses" element={<Expenses />} />
//       <Route path="parent/:name" element={<Parent />}>
//         <Route path="son1/:id" element={<Son1 />} />
//         <Route path="son2" element={<Son2 />} />
//       </Route>
//     </Routes>
//   </BrowserRouter>
// );

console.log('---');

const MyContext = createContext({ name: 'xiaoMing' });

const ShowName = () => {
  const name = useContext(MyContext).name;
  return <div>name: {name}</div>;
};

const ele = (
  <>
    <ShowName />
    <MyContext.Provider value={{ name: 'danny' }}>
      <ShowName />
      <MyContext.Provider value={{ name: 'aike' }}>
        <ShowName />
      </MyContext.Provider>
    </MyContext.Provider>
  </>
);

ReactDOM.render(ele, document.getElementById('root'));
