import React from 'react';
import { useIsMobile } from './hooks/useIsMobile';
import { useTimebox } from './hooks/useTimebox';
import TimeboxMobile from './components/mobile/TimeboxMobile';
import TimeboxDesktop from './components/desktop/TimeboxDesktop';
import LoadingScreen from './components/shared/LoadingScreen';

export default function TimeboxTool({ userCode, onSignOut }) {
  const isMobile = useIsMobile();
  const timebox = useTimebox({ userCode });

  if (timebox.isLoading) {
    return <LoadingScreen />;
  }

  return isMobile ? (
    <TimeboxMobile timebox={timebox} onSignOut={onSignOut} />
  ) : (
    <TimeboxDesktop timebox={timebox} onSignOut={onSignOut} />
  );
}
