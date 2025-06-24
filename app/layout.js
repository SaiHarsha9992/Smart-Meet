import { Josefin_Sans } from "next/font/google";
import "./globals.css";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "SmartMeet",
  description: "SmartMeet is an AI-powered mock interview platform that helps you prepare for real interviews by simulating the experience with personalized feedback.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${josefinSans.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
