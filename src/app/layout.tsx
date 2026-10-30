import type { Metadata } from "next";
import "./globals.css";
import RoomApp from "@/components/RoomApp";
export const metadata: Metadata = {
  title: "A Room of One’s Own — A little corner of the internet",
  description:
    "An interactive room for work, curious experiments, notes, and records. Come in and stay a while.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RoomApp />
        {children}
      </body>
    </html>
  );
}
