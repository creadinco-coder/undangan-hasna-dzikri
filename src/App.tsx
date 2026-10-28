/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { INVITATION_DATA } from './data/invitationData.ts';
import { parseGuestName } from './utils/invitationUtils.ts';
import { InvitationCover } from './components/InvitationCover.tsx';
import { WelcomingReflectionSection } from './components/WelcomingReflectionSection.tsx';
import { CoupleSection } from './components/CoupleSection.tsx';
import { EventSection } from './components/EventSection.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { MilestoneSection } from './components/MilestoneSection.tsx';
import { WeddingGiftSection } from './components/WeddingGiftSection.tsx';
import { ClosingSection } from './components/ClosingSection.tsx';
import { RSVPSection } from './components/RSVPSection.tsx';
import { FloatingNavigation } from './components/FloatingNavigation.tsx';
import { AudioController } from './components/AudioController.tsx';
import { SectionDivider } from './components/SectionDivider.tsx';
import { DashboardAuthGate } from './components/DashboardAuthGate.tsx';
import { ScrollToTopButton } from './components/ScrollToTopButton.tsx';

import { InteractivePathJourney } from './components/InteractivePathJourney.tsx';

// Framer Motion entrance animation configuration for invitation sections
const fadeInUpSectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 36,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Flow states:
// 'cover': Initial romantic cover
// 'interactive': Gamified orthogonal path-tracing slider journey
// 'unlocked': Full invitation unveiled
type InvitationFlowState = 'cover' | 'interactive' | 'unlocked';

// Helper to determine if current path, search param, or hash is couple dashboard
const checkIsDashboardRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/dashboard' ||
    path === '/admin' ||
    path === '/pasangan' ||
    path.endsWith('/dashboard') ||
    path.endsWith('/admin') ||
    search.includes('dashboard') ||
    search.includes('admin') ||
    search.includes('page=dashboard') ||
    search.includes('view=dashboard') ||
    hash.includes('dashboard') ||
    hash.includes('admin')
  );
};

export default function App() {
  const [isDashboard, setIsDashboard] = useState<boolean>(checkIsDashboardRoute);
  const [guestName, setGuestName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return parseGuestName(window.location.search, '');
    }
    return '';
  });
  const [flowState, setFlowState] = useState<InvitationFlowState>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search.toLowerCase();
      if (search.includes('skip=true') || search.includes('direct=true')) {
        return 'unlocked';
      }
    }
    return 'cover';
  });
  const [activeSection, setActiveSection] = useState<string>('couple');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const phoneContainerRef = useRef<HTMLDivElement | null>(null);

  const isUnlocked = flowState === 'unlocked';

  // Read URL query parameter 'to' dynamically with fallback 'Hasna' and monitor route
  useEffect(() => {
    const handleLocationChange = () => {
      setIsDashboard(checkIsDashboardRoute());
      const search = window.location.search;
      const parsed = parseGuestName(search, '');
      setGuestName(parsed);
    };

    handleLocationChange();

    // Listen to popstate or url changes
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Track scroll progress across invitation sections
  useEffect(() => {
    if (!isUnlocked) return;

    const handleScroll = () => {
      const winScroll = window.scrollY || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height > 0) {
        const percent = (winScroll / height) * 100;
        setScrollProgress(Math.min(100, Math.max(0, percent)));
      }
      setShowScrollTop(winScroll > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isUnlocked]);

  // IntersectionObserver to detect currently active section
  useEffect(() => {
    if (!isUnlocked) return;

    const sections = ['reflection', 'couple', 'event', 'gallery', 'story', 'gift', 'rsvp', 'closing'];
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Map 'reflection' to 'couple' so navigation highlights Mempelai
              setActiveSection(id === 'reflection' ? 'couple' : id);
            }
          });
        },
        { threshold: 0.25 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [isUnlocked]);

  // Transition from Cover -> Interactive Path-Tracing Slider Journey
  const handleOpenCover = () => {
    setFlowState('interactive');
  };

  // Transition from Interactive Path Journey -> Full Invitation Unlocked
  const handleUnlockFullInvitation = (targetSectionId?: string) => {
    setFlowState('unlocked');
    // Smoothly scroll to the target section or welcoming reflection section
    setTimeout(() => {
      const targetEl = targetSectionId
        ? document.getElementById(targetSectionId)
        : (document.getElementById('reflection') || document.getElementById('couple'));
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (phoneContainerRef.current) {
      phoneContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render dedicated Couple Dashboard view when URL is /dashboard or /admin
  if (isDashboard) {
    return (
      <DashboardAuthGate
        onBackToInvitation={() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#161D30] text-[#202A45] font-sans antialiased selection:bg-[#AFC9E5] selection:text-[#202A45]">
      {/* Main Container: On mobile it's 100% full screen. On desktop it's an elegant centered column with luxury ambient backdrop. */}
      <div
        ref={phoneContainerRef}
        className="mx-auto w-full max-w-md md:max-w-[430px] bg-[#F9F6EE] shadow-2xl min-h-screen relative"
      >
        {/* Subtle Scroll Progress Bar at the top of the viewport */}
        {isUnlocked && (
          <div
            className="fixed top-0 left-0 right-0 z-50 h-[3.5px] bg-[#DADDE0]/40 backdrop-blur-xs pointer-events-none"
            role="progressbar"
            aria-valuenow={Math.round(scrollProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progres membaca undangan"
          >
            <div
              className="h-full bg-gradient-to-r from-[#7395C0] via-[#AFC9E5] to-[#F8DDA6] shadow-xs transition-[width] duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        )}

        {/* 1. Dynamic Initial Romantic Cover Screen */}
        <InvitationCover
          data={INVITATION_DATA}
          guestName={guestName}
          onOpenInvitation={handleOpenCover}
          isOpen={flowState !== 'cover'}
        />

        {/* 2. Gamified Interactive Path-Tracing Slider Journey */}
        {flowState === 'interactive' && (
          <InteractivePathJourney
            data={INVITATION_DATA}
            guestName={guestName}
            onComplete={handleUnlockFullInvitation}
            onSkip={handleUnlockFullInvitation}
          />
        )}

        {/* Ambient Audio Controller: Starts music as soon as user interacts with cover */}
        <AudioController shouldStart={flowState !== 'cover'} />

        {/* 3. Main Unlocked Invitation Sections */}
        <main
          className={`w-full transition-opacity duration-700 ${
            isUnlocked ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Relatable Welcoming Reflection before Couple Profiles */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
            variants={fadeInUpSectionVariants}
          >
            <WelcomingReflectionSection
              guestName={guestName}
              photoUrl={INVITATION_DATA.heroCover.src}
              photoAlt={INVITATION_DATA.heroCover.alt}
              weddingDate={INVITATION_DATA.weddingDateDisplay}
            />
          </motion.div>

          {/* Couple Introduction Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
            variants={fadeInUpSectionVariants}
          >
            <CoupleSection data={INVITATION_DATA} />
          </motion.div>

          {/* Minimalist Transition Divider between Couple and Event Section */}
          <SectionDivider variant="transition-light-to-dark" />

          {/* Wedding Event (Akad & Resepsi) Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
            variants={fadeInUpSectionVariants}
          >
            <EventSection data={INVITATION_DATA} />
          </motion.div>

          {/* Decorative Floral-Inspired Transition Divider between Wedding Event and Gallery */}
          <SectionDivider variant="transition-dark-to-light" />

          {/* Gallery Section with Slow-Scrolling Parallax */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
            variants={fadeInUpSectionVariants}
          >
            <GallerySection data={INVITATION_DATA} />
          </motion.div>

          {/* Minimalist Floral Divider between Gallery and Milestone Story */}
          <SectionDivider variant="light" />

          {/* Milestone / Love Story Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
            variants={fadeInUpSectionVariants}
          >
            <MilestoneSection data={INVITATION_DATA} />
          </motion.div>

          {/* Minimalist Transition Divider between Milestone and Wedding Gift */}
          <SectionDivider variant="transition-light-to-dark" />

          {/* Wedding Gift Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
            variants={fadeInUpSectionVariants}
          >
            <WeddingGiftSection data={INVITATION_DATA} />
          </motion.div>

          {/* Minimalist Transition Divider between Wedding Gift and RSVP Section */}
          <SectionDivider variant="transition-dark-to-light" />

          {/* RSVP and Meal Preference Section with Couple Guest List Management */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
            variants={fadeInUpSectionVariants}
          >
            <RSVPSection guestName={guestName} />
          </motion.div>

          {/* Decorative Transition Divider between RSVP and Closing */}
          <SectionDivider variant="transition-light-to-dark" />

          {/* Closing & Prayer Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
            variants={fadeInUpSectionVariants}
          >
            <ClosingSection data={INVITATION_DATA} onScrollToTop={handleScrollToTop} />
          </motion.div>
        </main>

        {/* Floating Circular Navigation */}
        <FloatingNavigation
          activeSection={activeSection}
          onNavigate={handleNavigate}
          isVisible={isUnlocked}
          onReplayPath={() => setFlowState('interactive')}
        />

        {/* Floating Sticky Back-to-Top Button (Bottom Left, Icon Only, Appears on Scroll) */}
        <ScrollToTopButton
          isVisible={isUnlocked && showScrollTop}
          onClick={handleScrollToTop}
        />
      </div>
    </div>
  );
}
