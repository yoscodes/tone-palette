"use client";

import { useState } from "react";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f2f2f6" }}>
      <style>{`
        .app-topbar {
          display: none;
        }
        .app-backdrop {
          display: none;
        }
        @media (max-width: 768px) {
          .app-topbar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: #fff;
            border-bottom: 1px solid rgba(20,20,40,.07);
            position: sticky;
            top: 0;
            z-index: 30;
            flex-shrink: 0;
          }
          .app-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 40;
          }
          .app-sidebar-wrap {
            position: fixed !important;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          }
          .app-sidebar-wrap--open {
            transform: translateX(0);
          }
        }
      `}</style>

      {sidebarOpen && (
        <div className="app-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <AppSidebar
        sidebarClassName={`app-sidebar-wrap${sidebarOpen ? " app-sidebar-wrap--open" : ""}`}
        onClose={() => setSidebarOpen(false)}
      />

      <main style={{ flex: 1, overflowY: "auto", minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div className="app-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              border: "none", background: "none", cursor: "pointer",
              padding: "6px", borderRadius: 8, color: "#4a4d60",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            aria-label="メニューを開く"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ position: "relative", width: 22, height: 18, flexShrink: 0 }}>
              <div style={{ position: "absolute", left: 0, top: 2, width: 12, height: 12, borderRadius: "50%", background: "#ff8a5b", mixBlendMode: "multiply" }} />
              <div style={{ position: "absolute", left: 8, top: 0, width: 12, height: 12, borderRadius: "50%", background: "#7b8cf0", mixBlendMode: "multiply" }} />
              <div style={{ position: "absolute", left: 4, top: 6, width: 10, height: 10, borderRadius: "50%", background: "#f76b8a", mixBlendMode: "multiply" }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.01em", color: "#1c1f2b" }}>tone palette</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
