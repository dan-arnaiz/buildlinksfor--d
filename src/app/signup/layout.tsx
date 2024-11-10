import React from 'react';

const SignupLayout = ({ children }) => {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
};

export const metadata = {
  title: "Create an Account",
  description: "Signup to Publisher Database",
};

export default SignupLayout;