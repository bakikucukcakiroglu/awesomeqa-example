import type { Metadata } from 'next'
import Layout from "../components/Layout";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: 'Awesome Ticket Challenge',
  description: 'Awesome Ticket Challenge',
}

function MyApp({ children }: { children: React.ReactNode }) {
  return (
    <>
      <html lang="en" >
        <body >
          <Layout>
            {children}
          </Layout>
        </body>
      </html>
    </>
  );
}

export default MyApp;