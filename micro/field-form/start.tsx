import React, { useState } from 'react';
import ReactDOM from 'react-dom';

// import Form, { Field } from './es';
import Form, { Field } from './src';

const Ele = () => {
  const [form] = Form.useForm();

  //   const handleSubmit = () => {
  //     const data = form.get
  //   }

  //   return (
  //     <>
  //       <Form form={form}>
  //         <Field name="age">
  //           <input />
  //         </Field>
  //         <Field name="name" initialValue="danny">
  //           <input placeholder="name" />
  //         </Field>
  //       </Form>
  //       <button onClick={handleSubmit}>get values</button>
  //     </>
  //   );

  const [count, setCount] = useState(0);
  return (
    <>
      <div>
        <Form form={form} preserve={false}>
          {count % 2 === 0 ? (
            <Field name={['person']}>
              <input />
            </Field>
          ) : null}
          <br />
          <Field name={['name']}>
            <input />
          </Field>
          <br />

          <Field name="age">
            <input />
          </Field>
          <br />
        </Form>
        <button onClick={() => setCount(count + 1)}>++</button>
        <button
          onClick={() => {
            // console.log(form.getFieldsValue());
            // console.log(form.getFieldsValue(['person', 'name']));
            // console.log(form.getFieldsValue(['name', 'sex']));
            console.log(form.getFieldsValue(['e1', 'person', 'e2']));
          }}
        >
          show value
        </button>
      </div>
    </>
  );
};

ReactDOM.render(<Ele />, document.getElementById('root'));
