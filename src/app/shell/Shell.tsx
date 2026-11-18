import { motion, MotionConfig } from 'motion/react';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Toaster } from '@/components/ui/Toast';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { StoreProvider } from '../store';
import { Rail } from './Rail';
import { TopBar } from './TopBar';
import s from './Shell.module.css';

function ScrollTop() {
  const p = useLocation().pathname;
  useEffect(() => {
    document.getElementById('app-scroll')?.scrollTo({ top: 0 });
  }, [p]);
  return null;
}

export function Shell() {
  const p = useLocation().pathname;
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <StoreProvider>
          <div className={s.app}>
            <div className={s.railBox}>
              <Rail />
            </div>
            <div className={s.main}>
              <TopBar />
              <motion.main layoutScroll className={s.scroll} id="app-scroll">
                <ScrollTop />
                <div className={`${s.body} page-in`} key={p}>
                  <Outlet />
                </div>
              </motion.main>
            </div>
          </div>
          <Toaster />
        </StoreProvider>
      </TooltipProvider>
    </MotionConfig>
  );
}
