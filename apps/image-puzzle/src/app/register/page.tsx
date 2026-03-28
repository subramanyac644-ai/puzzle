'use client';

import React, { Suspense } from 'react';
import Register from '../../components/Auth/Register';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Register />
    </Suspense>
  );
}
