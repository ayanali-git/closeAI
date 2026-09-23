import React from 'react';
import { cookies } from 'next/headers';
import { SidebarProvider } from '@/components/chat/sidebar-context';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const sidebarCookie = cookieStore.get('sidebar_open');
  const defaultOpen = sidebarCookie !== undefined ? sidebarCookie.value === 'true' : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div data-chat-page="true" className="chat-selection-theme selection:bg-secondary selection:text-foreground fixed inset-0 h-[100dvh] w-full overflow-hidden flex flex-col no-overscroll">
        {children}
      </div>
    </SidebarProvider>
  );
}
