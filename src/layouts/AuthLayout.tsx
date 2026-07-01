import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const AuthLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isRegister = location.pathname.includes('/register');

  return (
    <div className={`min-h-screen w-full flex bg-background text-foreground selection:bg-primary/30 ${isRegister ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Left side: Branding / Graphic */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors z-20 shadow-[0_0_50px_rgba(0,0,0,0.1)]"
      >
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/20 dark:bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/20 dark:bg-secondary/20 blur-[100px] pointer-events-none" />

        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-primary-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379L12 21l3.12-3.13c1.153-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">VieChat</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-white">Connect, collaborate, and create together.</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Experience real-time messaging with a beautiful, modern interface designed for teams and communities.
          </p>
        </div>

        <div className="relative z-10 text-sm text-zinc-500 font-medium">
          &copy; {new Date().getFullYear()} VieChat Inc. All rights reserved.
        </div>
      </motion.div>

      {/* Right side: Form */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background relative z-10"
      >
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-primary-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379L12 21l3.12-3.13c1.153-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">VieChat</span>
        </div>

        {/* Theme Toggle Button */}
        <div className="absolute top-8 right-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="w-10 h-10 rounded-full bg-muted/30 hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            )}
          </Button>
        </div>
        
        <div className="w-full max-w-[400px]">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};
