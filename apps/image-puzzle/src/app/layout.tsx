'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthProvider } from '@core-hubble/context';
import Navbar from '../components/Layout/Navbar';
import '../styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DndProvider backend={HTML5Backend}>
            <div className="app-container">
              <Navbar />
              <main>{children}</main>
            </div>
          </DndProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
