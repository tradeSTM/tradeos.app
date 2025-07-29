import { UnifiedDashboard } from '../components/dashboard/UnifiedDashboard';
import { TestModeProvider } from '../components/test/TestModeProvider';
import Head from 'next/head';

export default function DashboardPage() {
  return (
    <TestModeProvider>
      <Head>
        <title>TradeOS Dashboard</title>
        <meta name="description" content="TradeOS Core Control Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <UnifiedDashboard />

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html,
        body {
          background: #121212;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </TestModeProvider>
  );
}
