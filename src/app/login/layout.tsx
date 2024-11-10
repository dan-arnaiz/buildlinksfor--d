import React from 'react';

const LoginLayout = ({ children }) => {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
};

export const metadata = {
  title: "Login",
  description: "Login to Publisher Database",
};

export default LoginLayout;